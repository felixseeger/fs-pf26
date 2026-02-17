import { CheckCircle } from "lucide-react";

interface OrderSummaryProps {
  courseName: string;
  price?: number;
  currency?: string;
  priceType?: string;
  includes?: { item_text?: string }[];
  guaranteeHeading?: string;
  guaranteeText?: string;
}

export function OrderSummary({
  courseName,
  price,
  currency,
  priceType,
  includes,
  guaranteeHeading,
  guaranteeText,
}: OrderSummaryProps) {
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  return (
    <div className="bg-background border border-border p-8 rounded-2xl shadow-md max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-4">
          <span className="text-lg font-medium text-foreground">Item:</span>
          <span className="text-lg text-muted-foreground">{courseName}</span>
        </div>

        {includes && includes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">Includes:</h3>
            <ul className="space-y-1 text-muted-foreground">
              {includes.map((inc, i) => (
                <li key={i} className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500 shrink-0" />{" "}
                  {inc.item_text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {price != null && (
          <div className="flex justify-between items-center border-t border-border pt-4 mt-4">
            <span className="text-xl font-bold text-foreground">Total:</span>
            <span className="text-xl font-bold text-foreground">
              {currencySymbol}{price}
              {priceType === 'subscription' && (
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              )}
            </span>
          </div>
        )}

        {(guaranteeHeading || guaranteeText) && (
          <div className="bg-lime-50 dark:bg-lime-950 border border-lime-200 dark:border-lime-700 p-4 rounded-xl mt-4">
            {guaranteeHeading && (
              <h3 className="text-xl font-semibold text-lime-800 dark:text-lime-200 mb-2">
                {guaranteeHeading}
              </h3>
            )}
            {guaranteeText && (
              <p className="text-lime-700 dark:text-lime-300">{guaranteeText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
