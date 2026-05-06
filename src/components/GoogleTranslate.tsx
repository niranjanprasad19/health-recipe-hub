import { useEffect } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

/**
 * Embeds the Google Website Translator widget.
 * Provides instant translation into 100+ languages on top of i18next.
 */
export const GoogleTranslate = () => {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div
      id="google_translate_element"
      className="inline-flex items-center [&_.goog-te-gadget]:!text-xs [&_.goog-te-gadget]:!font-medium [&_.goog-logo-link]:!hidden [&_.goog-te-gadget>span]:!hidden [&_select]:!bg-transparent [&_select]:!border [&_select]:!border-border [&_select]:!rounded-md [&_select]:!px-2 [&_select]:!py-1 [&_select]:!text-foreground"
    />
  );
};
