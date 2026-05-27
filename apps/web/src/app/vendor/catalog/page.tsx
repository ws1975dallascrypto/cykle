'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Zap, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { useVendorDashboard } from '@/hooks/useVendorDashboard';
import { useVendorServices, useDeleteService, useUpdateService, ServiceData } from '@/hooks/useVendorServices';
import { ServiceForm } from '@/components/vendor/ServiceForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formatPHP } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function VendorCatalogPage() {
  const { data: dash } = useVendorDashboard();
  const vendorId = dash?.vendor?.id ?? null;
  const { data: services = [], isLoading } = useVendorServices(vendorId);
  const { mutate: deleteService } = useDeleteService();
  const { mutate: updateService } = useUpdateService();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner /></div>;
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Service Catalog</h1>
          <p className="text-sm text-slate-500">{services.length} service{services.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>

      {/* Add / Edit form */}
      {(showAddForm || editingService) && (
        <Card>
          <CardContent className="py-4">
            <h2 className="font-bold text-slate-900 mb-4">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>
            <ServiceForm
              existing={editingService ?? undefined}
              onClose={() => { setShowAddForm(false); setEditingService(null); }}
            />
          </CardContent>
        </Card>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center gap-3">
          <Package className="h-12 w-12 text-slate-300" />
          <p className="font-semibold text-slate-700">No services yet</p>
          <p className="text-sm text-slate-400">Add your first service to start receiving orders.</p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" /> Add Your First Service
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => {
            const itemsExpanded = expandedItems.has(service.id);
            return (
              <Card key={service.id} className={cn(!service.isActive && 'opacity-60')}>
                <CardContent className="py-3 px-4 space-y-0">
                  {/* Service header row */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{service.name}</span>
                        {service.isExpress && (
                          <Badge variant="express"><Zap className="h-3 w-3" />Express</Badge>
                        )}
                        {!service.isActive && (
                          <Badge variant="neutral">Inactive</Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-sm">
                        <span className="font-bold text-brand-600">{formatPHP(service.basePrice)}</span>
                        <span className="text-slate-400">/{service.unit}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{service.turnaroundHours}h</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{service.pricingType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Toggle active */}
                      <button
                        onClick={() => updateService({ id: service.id, data: { isActive: !service.isActive } })}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                        title={service.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {service.isActive
                          ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                          : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => setEditingService(service)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${service.name}"?`)) deleteService(service.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Service items expander */}
                  {service.serviceItems.length > 0 && (
                    <div className="mt-2 border-t border-slate-50 pt-2">
                      <button
                        onClick={() => toggleItemExpand(service.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                      >
                        {itemsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {service.serviceItems.length} item type{service.serviceItems.length !== 1 ? 's' : ''}
                      </button>

                      {itemsExpanded && (
                        <div className="mt-2 space-y-1">
                          {service.serviceItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
                              <span className="text-slate-700">{item.name}</span>
                              <span className="font-bold text-slate-900">{formatPHP(item.pricePerItem)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
