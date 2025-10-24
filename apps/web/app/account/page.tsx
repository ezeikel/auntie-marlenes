import { getUser } from '@/app/actions';

const AccountPage = async () => {
  const user = await getUser();

  return (
    <div>
      <h1>Account</h1>
    </div>
  );
};

export default AccountPage;
