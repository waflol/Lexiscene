import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {

  if (!locale || !["vi", "en"].includes(locale)) {
    locale = "vi";
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
