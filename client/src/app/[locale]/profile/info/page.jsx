import UserDetailsForm from "@features/user-details";
import { createI18nServer, getCurrentUser, getMessages } from "@shared";
import { cookies } from "next/headers";

export default async function ProfilePage({
    params,
}) {
    const { locale = "ua" } = await params;
    const messages = await getMessages(locale);
    const { t } = createI18nServer(messages);

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    const user = await getCurrentUser(token.value);

    const nameFromProfile =
        (user?.firstName || user?.name || "").trim();
    const phoneFallback =
        (user?.phone || user?.email || "").trim();
    const displayName =
        nameFromProfile || phoneFallback || t("profile.guestName");
    return (
        <div className="profile-page">
            <div className="profile-page__prev">
                <p className="profile-page__subtitle">{t('profile.subtitle-prof', { name: displayName })}</p>
                <h2 className="profile-page__title">{t("profile.title-prof")}</h2>
            </div>

            <div >
                <UserDetailsForm user={user} location={"profile"} />
            </div>
        </div>
    );
}