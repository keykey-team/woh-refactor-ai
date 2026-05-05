import FinishReset from "@features/finish-reset";
import { createI18nServer, getMessages } from "@shared";
import Breadcrumbs from "@widgets/brad-crumps";




const ResetPage = async ({ params }) => {
  const messages = await getMessages(
    params.locale,
  );
  const { t } = createI18nServer(messages);
  return (
    <>
      <Breadcrumbs
        locale={params.locale}
        labels={{
          home: t("breadcrumbs.home"),
          page: t("breadcrumbs.page"),
        }}
        pageName={t("breadcrumbs.guarantees")}
      />

      <div className="container">
        <FinishReset/>
      </div>
    </>
  );
};

export default ResetPage;
