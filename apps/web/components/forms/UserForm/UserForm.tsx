'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { updateUser } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type UserFormProps = {
  className?: string;
};

const UserForm = ({ className }: UserFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  // const [state, formAction] = useFormState(updateUser, )

  return (
    <div
      className={cn({
        [className as string]: !!className,
      })}
    >
      <h1 className="text-3xl font-semibold text-center text-gray-700 dark:text-white">
        My Details
      </h1>
      <form
        action={async (formData) => {
          // await contributeProverbWithId(formData);

          // reset the form
          formRef.current?.reset();
        }}
        className="flex flex-wrap gap-4 p-4 m-auto"
        ref={formRef}
      >
        <Label htmlFor="firstName">First Name</Label>
        <Input name="firstName" />
        <Label htmlFor="lastName">Last Name</Label>
        <Input name="lastName" />
        <Label htmlFor="email">Email Address</Label>
        <Input name="email" />
        <Button>Save Changes</Button>
      </form>
    </div>
  );
};

export default UserForm;
