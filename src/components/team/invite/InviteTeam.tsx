"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { PiArrowsClockwise, PiLinkDuotone, PiPaperPlaneTilt } from "react-icons/pi";
import { toast } from "sonner";
import { type Output } from "valibot";
import { Button } from "~/components/ui/button";
import { CopyButton } from "~/components/ui/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Loader } from "~/components/ui/loader";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { sendInviteSchema } from "~/server/db/edge-schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { TextKBD } from "../../ui/kbd";

export const InviteTeam = ({
  workspace,
  workspaceSlug,
}: {
  workspace: RouterOutputs["workspaces"]["getBySlug"];
  workspaceSlug: string;
}) => {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const {
    data: { data },
  } = api.workspaces.getBySlug.useQuery(
    { slug: workspaceSlug },
    {
      initialData: workspace,
    },
  );

  const invite = api.emails.sendWorkspaceInvite.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rotateInviteLink = api.workspaces.rotateInviteLink.useMutation({
    onSuccess: async () => {
      return utils.workspaces.getBySlug.invalidate({ slug: workspaceSlug });
    },
  });

  const openChange = (open: boolean) => {
    setOpen(open);
    form.reset();
  };

  const form = useForm<Output<typeof sendInviteSchema>>({
    resolver: valibotResolver(sendInviteSchema),
    defaultValues: {
      userEmails: [
        {
          email: "",
        },
      ],
      workspaceSlug: workspaceSlug,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "userEmails",
  });

  const addBlankEmail = () => {
    append({ email: "" });
  };

  const onSubmit = form.handleSubmit((values) => {
    setOpen(false);
    toast.promise(invite.mutateAsync(values), {
      loading: "Sending invites...",
      success: "Invites sent!",
    });
  });

  const handleRotateInviteLink = () => {
    toast.promise(rotateInviteLink.mutateAsync({ workspaceSlug }), {
      loading: "Updating ...",
      success: "Invite link rotated!",
    });
  };

  if (!data) {
    return <div>Something happened with the invite</div>;
  }

  return (
    <Alert>
      <AlertTitle className="text-base">Invite teammates</AlertTitle>

      <AlertDescription className="gap-4">
        <p className="text-muted-foreground">
          Share this link with your team members to invite them to this workspace.
        </p>
        <div className="flex gap-2">
          <TextKBD size="lg">{data.inviteLink}</TextKBD>

          <CopyButton text={data.inviteLink ?? ""} />

          <Dialog>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant={"secondary"} size={"icon"}>
                      <PiArrowsClockwise size={15} />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>

                <TooltipContent>Rotate invite link</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DialogContent className="max-w-sm">
              <DialogTitle>Rotate invite link</DialogTitle>
              <DialogDescription>
                Rotating the invite link will invalidate the previous link and generate a new one.
              </DialogDescription>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"outline"}>Cancel</Button>
                </DialogClose>

                <Button disabled={rotateInviteLink.isLoading} onClick={handleRotateInviteLink}>
                  {rotateInviteLink.isLoading && <Loader />}
                  Rotate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Separator />

        <p className="text-muted-foreground">You can also invite them directly via email</p>

        <Dialog open={open} onOpenChange={openChange}>
          <DialogTrigger asChild>
            <Button className="w-max">
              <PiLinkDuotone size={15} />
              Invite by email
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-sm">
            <DialogTitle>Invite by email</DialogTitle>
            <DialogDescription>Invite your team members to this workspace .</DialogDescription>

            <Form {...form}>
              <form className="grid grid-cols-1 gap-5" onSubmit={onSubmit}>
                <section className="grid grid-cols-1 gap-2">
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`userEmails.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex w-full items-center gap-2">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="someone@example.com"
                                className="w-full"
                              />
                            </FormControl>

                            <Button
                              variant={"destructive"}
                              size={"icon"}
                              type="button"
                              disabled={fields.length === 1}
                              onClick={() => remove(index)}
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </section>

                <Button variant={"outline"} type="button" onClick={addBlankEmail}>
                  <PlusIcon />
                  Add more
                </Button>

                <DialogFooter>
                  <Button type="submit">
                    <PiPaperPlaneTilt />
                    Send
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </AlertDescription>
    </Alert>
  );
};
