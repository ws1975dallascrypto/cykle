'use client';

import { useState } from 'react';
import { Plus, Minus, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPHP } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart.store';
import { PricingType } from '@cykle/shared';
import type { VendorDetail } from '@/hooks/useVendors';


interface ServiceCatalogProps {
  vendor: VendorDetail;
}

export function ServiceCatalog({ vendor }: ServiceCatalogProps) {
  return (
    <div className="space-y-4">
      {vendor.services.map((service) => (
        <ServiceSection key={service.id} service={service} vendorId={vendor.id} vendorName={vendor.shopName} />
      ))}
    </div>
  );
}

function ServiceSection({
  service,
  vendorId,
  vendorName,
}: {
  service: VendorDetail['services'][0];
  vendorId: string;
  vendorName: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const { addItem, items, updateQuantity, setVendor } = useCartStore();

  const getQty = (serviceId: string, itemId?: string) =>
    items.find((i) => i.serviceId === serviceId && i.serviceItemId === itemId)?.quantity ?? 0;

  const handleAdd = (unitPrice: number, name: string, itemId?: string, itemName?: string) => {
    setVendor(vendorId, vendorName);
    addItem({
      serviceId: service.id,
      serviceItemId: itemId,
      serviceName: service.name,
      itemName: itemName ?? name,
      quantity: 1,
      unitPrice,
      pricingType: service.pricingType as PricingType,
    });
  };

  const handleUpdate = (qty: number, itemId?: string) => {
    updateQuantity(service.id, qty, itemId);
  };

  // PER_KG services: show as bulk
  if (service.pricingType === 'PER_KG') {
    const qty = getQty(service.id);
    return (
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900">{service.name}</h3>
              {service.isExpress && (
                <Badge variant="express"><Zap className="h-3 w-3" />Express</Badge>
              )}
            </div>
            {service.description && (
              <p className="text-sm text-slate-500 mt-0.5">{service.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-brand-600 font-bold">{formatPHP(service.basePrice)}/kg</span>
              <span className="text-xs text-slate-400">· {service.turnaroundHours}h turnaround</span>
            </div>
          </div>
          <QuantityControl
            qty={qty}
            onAdd={() => handleAdd(service.basePrice, service.name)}
            onUpdate={(q) => handleUpdate(q)}
            unit="kg"
          />
        </div>
      </div>
    );
  }

  // PER_ITEM services: show sub-items
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <button
        className="flex w-full items-center justify-between p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">{service.name}</h3>
          </div>
          {service.description && (
            <p className="text-sm text-slate-500 mt-0.5">{service.description}</p>
          )}
          <span className="text-xs text-slate-400">From {formatPHP(service.basePrice)}/item · {service.turnaroundHours}h</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-50 border-t border-slate-50">
          {service.serviceItems.length > 0
            ? service.serviceItems.map((item) => {
                const qty = getQty(service.id, item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="text-sm text-brand-600 font-semibold">{formatPHP(item.pricePerItem)}</p>
                    </div>
                    <QuantityControl
                      qty={qty}
                      onAdd={() => handleAdd(item.pricePerItem, service.name, item.id, item.name)}
                      onUpdate={(q) => handleUpdate(q, item.id)}
                    />
                  </div>
                );
              })
            : (
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{service.name}</p>
                  <p className="text-sm text-brand-600 font-semibold">{formatPHP(service.basePrice)}/item</p>
                </div>
                <QuantityControl
                  qty={getQty(service.id)}
                  onAdd={() => handleAdd(service.basePrice, service.name)}
                  onUpdate={(q) => handleUpdate(q)}
                />
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function QuantityControl({
  qty,
  onAdd,
  onUpdate,
  unit,
}: {
  qty: number;
  onAdd: () => void;
  onUpdate: (qty: number) => void;
  unit?: string;
}) {
  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:scale-95 transition-all"
      >
        <Plus className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onUpdate(qty - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-bold text-slate-900">
        {qty}{unit ? <span className="text-xs text-slate-400">{unit}</span> : ''}
      </span>
      <button
        onClick={onAdd}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 active:scale-95 transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
