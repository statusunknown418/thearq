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
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "~/components/ui/form";
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

  const invite = api.emails.sendWorkspaceInvite.useMutation({
    onSuccess: () => toast.success("Invites sent!"),
    onMutate: () => {
      setOpen(false);
      toast.loading("Sending invites...");
    },
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
    invite.mutate(values);
  });

  return (
    <div>
      <h1>Invite Members</h1>

      <p>Invite with link</p>

      <kbd className="kbd">{workspace.inviteLink}</kbd>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Invite by email</Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogTitle>Invite by email</DialogTitle>
          <DialogDescription>
            Invite your team members to this workspace .
          </DialogDescription>

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
                          <Input
                            {...field}
                            placeholder="someone@example.com"
                            className="flex-grow"
                          />

                          <Button
                            variant={"destructive"}
                            size={"icon"}
                            type="button"
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

              <Button
                size={"xs"}
                variant={"neutral"}
                rounding={"md"}
                className="justify-self-end"
                type="button"
                onClick={addBlankEmail}
              >
                <PlusIcon />
                Add more
              </Button>

              <Button type="submit" className="w-max">
                Send
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
