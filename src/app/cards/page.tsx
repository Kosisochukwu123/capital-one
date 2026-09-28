import { BankingPage } from "@/components/banking/banking-page";
import { CardsView } from "@/components/banking/cards-view";

export default function CardsPage() {
  return (
    <BankingPage title="My card">
      <CardsView />
    </BankingPage>
  );
}