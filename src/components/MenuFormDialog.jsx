import { PencilLine, Plus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function MenuFormDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  idPrefix,
  name,
  onNameChange,
  price,
  onPriceChange,
  description,
  onDescriptionChange,
  imagePreview,
  imageFileName,
  onImageSelect,
  onRemoveImage,
  error,
  saving,
  onSubmit,
  submitLabel,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-0">
        <div className="p-6 sm:p-8">
          <DialogTitle asChild>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PencilLine className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="text-sm font-normal text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </DialogTitle>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${idPrefix}-name`}>
                  상품명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`${idPrefix}-name`}
                  className="h-12"
                  placeholder="예) 토마토 파스타"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${idPrefix}-price`}>
                  가격 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-muted-foreground">
                    ₩
                  </span>
                  <Input
                    id={`${idPrefix}-price`}
                    type="number"
                    min="0"
                    className="h-12 pl-10"
                    placeholder="예) 12,000"
                    value={price}
                    onChange={(e) => onPriceChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-description`}>설명</Label>
              <div className="relative">
                <textarea
                  id={`${idPrefix}-description`}
                  className="min-h-28 w-full resize-none rounded-lg border border-input bg-transparent p-3 pb-6 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="메뉴에 대한 간단한 설명을 입력해 주세요."
                  maxLength={200}
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground">
                  {description.length} / 200
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-image`}>사진</Label>
              <label
                htmlFor={`${idPrefix}-image`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onImageSelect(e.dataTransfer.files?.[0]);
                }}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center hover:bg-muted/50"
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <p className="text-sm">{imageFileName}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onRemoveImage();
                      }}
                      className="text-xs text-muted-foreground underline"
                    >
                      사진 제거
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm">여기를 클릭하거나 파일을 드래그해 주세요.</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG 파일만 가능 (최대 5MB)</p>
                    </div>
                  </>
                )}
                <input
                  id={`${idPrefix}-image`}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => onImageSelect(e.target.files?.[0])}
                />
              </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-fit gap-1.5" disabled={saving}>
              <Plus className="size-4" />
              {saving ? "저장 중..." : submitLabel}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MenuFormDialog;
