import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ServicesTable = ({ services, weekNumber }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => `$${amount?.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString)?.toLocaleDateString('en-US');

  const totalSales = services?.reduce((sum, service) => sum + service?.amount, 0);

  return (
    <div className="bg-card border border-border rounded-lg mb-4">
      <div 
        className="flex items-center justify-between p-4 border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Icon name="List" size={20} className="text-primary" />
          <div>
            <h4 className="font-medium text-foreground">Week {weekNumber} Services</h4>
            <p className="text-sm text-muted-foreground">{services?.length} services • {formatCurrency(totalSales)} total sales</p>
          </div>
        </div>
        
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </div>
      {isExpanded && (
        <div className="p-4">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Service</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {services?.map((service, index) => (
                  <tr key={index} className="border-b border-border last:border-b-0">
                    <td className="py-3 px-3 text-sm text-foreground">{formatDate(service?.date)}</td>
                    <td className="py-3 px-3 text-sm text-foreground">{service?.client}</td>
                    <td className="py-3 px-3 text-sm text-foreground">{service?.service}</td>
                    <td className="py-3 px-3 text-sm text-foreground text-right font-mono">{formatCurrency(service?.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted">
                  <td colSpan="3" className="py-3 px-3 text-sm font-medium text-foreground">Total Sales</td>
                  <td className="py-3 px-3 text-sm font-bold text-foreground text-right font-mono">{formatCurrency(totalSales)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {services?.map((service, index) => (
              <div key={index} className="bg-muted rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-foreground">{service?.service}</div>
                    <div className="text-sm text-muted-foreground">{service?.client}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium text-foreground">{formatCurrency(service?.amount)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(service?.date)}</div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Total Sales</span>
                <span className="font-mono font-bold text-primary">{formatCurrency(totalSales)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesTable;