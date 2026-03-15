import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export default function OpenSharedLink() {
  const { t } = useTranslation();
  const [link, setLink] = useState<string>("");

  function handleOpenLink() {
    if (link) {
      window.open(link, "_blank");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t("openLink.trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("openLink.title")}</DialogTitle>
          <DialogDescription>
            {t("openLink.description")}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder={t("openLink.placeholder")}
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </DialogClose>
          <Button type="submit" onClick={handleOpenLink}>
            {t("openLink.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}