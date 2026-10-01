import { BankingPage } from "@/components/banking/banking-page";
import { HelpCenter } from "@/components/help/help-center";

export default function HelpPage() {
  return (
    <BankingPage title="Help">
      <HelpCenter />
    </BankingPage>
  );
}