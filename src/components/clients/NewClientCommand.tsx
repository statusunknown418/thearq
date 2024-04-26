import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useCommandsStore } from "~/lib/stores/commands-store";

export const NewClientCommand = () => {
  const open = useCommandsStore((s) => s.opened) === "new-client";
  const setCommand = useCommandsStore((s) => s.setCommand);

  const onOpenChange = (opened: boolean) => {
    setCommand(opened ? "new-client" : null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
          <DialogDescription>Optionally add more details to the client.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
