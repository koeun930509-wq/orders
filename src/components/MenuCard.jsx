import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function MenuCard({ item, onAdd }) {
  return (
    <Card className="rounded-none border-b border-border p-0 py-5 ring-0 max-sm:first:pt-0 xl:rounded-md xl:p-0 xl:ring-1 xl:ring-foreground/10">
      <CardContent className="flex items-stretch gap-3 p-0 xl:gap-5">
        {item.image && (
          <div className="relative h-24 w-24 shrink-0 xl:h-auto xl:w-36">
            <img
              src={item.image}
              alt={item.name}
              className={`h-24 w-24 rounded-md object-cover xl:h-auto xl:w-36 xl:rounded-none xl:rounded-l-md ${item.is_sold_out ? "grayscale" : ""}`}
            />
            {item.is_sold_out && (
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 xl:rounded-none xl:rounded-l-md">
                <span className="text-xs font-medium text-white">품절</span>
              </div>
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-0 xl:gap-1 xl:py-[22px] xl:pr-4">
          <h3 className="text-base font-bold leading-tight xl:text-[1.2rem] xl:font-medium">{item.name}</h3>
          <p className="text-sm leading-snug text-muted-foreground">{item.description}</p>
          <div className="mt-auto flex items-end justify-between pt-1">
            <span className="text-[1.2rem] font-bold leading-none xl:font-medium">{item.price.toLocaleString()}원</span>
            <Button
              className="rounded-[8px] bg-[#ccc] hover:bg-[#ccc]"
              onClick={onAdd}
              disabled={item.is_sold_out}
            >
              {item.is_sold_out ? "품절" : "담기"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MenuCard;
