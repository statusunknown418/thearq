"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Output } from "valibot";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { sendInviteSchema } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

export const InviteMembers = ({
  workspace,
}: {
  workspace: RouterOutputs["workspaces"]["getBySlug"];
}) => {
  const [open, setOpen] = useState(false);
  const openChange = (open: boolean) => {
    setOpen(open);
    form.reset();
  };

  const invite = api.emails.sendWorkspaceInvite.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<Output<typeof sendInviteSchema>>({
    resolver: valibotResolver(sendInviteSchema),
    defaultValues: {
      userEmails: [
        {
          email: "",
        },
      ],
      workspaceSlug: workspace.slug,
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

  return (
    <div>
      <h1>Invite Members</h1>

      <p>Invite with link</p>

      <kbd className="kbd">{workspace.inviteLink}</kbd>

      <Dialog open={open} onOpenChange={openChange}>
        <DialogTrigger asChild>
          <Button>Invite by email</Button>
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
                <Button type="submit">Send</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
