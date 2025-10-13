import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalFooter, ModalTitle, ModalDescription } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

interface UserStatusEditorProps {
  user: {
    onboardingComplete: boolean;
    userType: string;
    [key: string]: any;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fields: { onboardingComplete: boolean; userType: string }) => void;
}

export const UserStatusEditor: React.FC<UserStatusEditorProps> = ({ user, open, onOpenChange, onSave }) => {
  const [onboardingComplete, setOnboardingComplete] = useState(user.onboardingComplete);
  const [userType, setUserType] = useState(user.userType);

  useEffect(() => {
    setOnboardingComplete(user.onboardingComplete);
    setUserType(user.userType);
  }, [user]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit User Status</ModalTitle>
          <ModalDescription>Update onboarding status and user type.</ModalDescription>
        </ModalHeader>
        <div className="space-y-4 py-4">
          <label className="flex items-center gap-2">
            <span>Onboarding Complete:</span>
            <input type="checkbox" checked={onboardingComplete} onChange={e => setOnboardingComplete(e.target.checked)} />
          </label>
          <label className="flex flex-col gap-1">
            <span>User Type:</span>
            <select value={userType} onChange={e => setUserType(e.target.value)} className="border rounded px-2 py-1">
              <option value="business">Business</option>
              <option value="influencer">Influencer</option>
            </select>
          </label>
        </div>
        <ModalFooter>
          <Button type="button" onClick={() => onSave({ onboardingComplete, userType })}>
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
