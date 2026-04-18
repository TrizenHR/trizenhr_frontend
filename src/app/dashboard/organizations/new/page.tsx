import { redirect } from 'next/navigation';

export default function NewOrganizationPage() {
  redirect('/dashboard/organizations?create=1');
}
