import { setRequestLocale } from 'next-intl/server';

type OrdersPageProps = {
  params: Promise<{ locale: string }>;
};

const OrdersPage = async ({ params }: OrdersPageProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <h1>Orders</h1>
    </div>
  );
};

export default OrdersPage;
