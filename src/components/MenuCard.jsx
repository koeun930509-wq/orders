import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MenuCard({ item, onAdd }) {
  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-base font-medium">{item.price.toLocaleString()}원</span>
        <Button className="rounded-[8px]" onClick={onAdd}>담기</Button>
      </CardContent>
    </Card>
  );
}

export default MenuCard;
