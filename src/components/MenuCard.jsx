import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function MenuCard({ item, onAdd }) {
  return (
    <Card className="rounded-md p-4">
      <CardContent className="flex items-stretch gap-3 p-0">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="h-24 w-24 shrink-0 rounded-md object-cover md:h-36 md:w-36"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-[1.2rem] font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
          <div className="mt-auto flex items-end justify-between pt-1">
            <span className="text-[1.56rem] font-medium">{item.price.toLocaleString()}원</span>
            <Button className="rounded-[8px]" onClick={onAdd}>담기</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MenuCard;
