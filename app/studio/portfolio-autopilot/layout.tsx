import DesignerProfileNav from "@/components/DesignerProfileNav";

export default function PortfolioAutopilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto max-w-5xl px-6">
        <DesignerProfileNav active="assistant" />
      </div>
      {children}
    </>
  );
}
