import { useCallback, useEffect, useState } from "react";
import { sanitizeProfile, type BusinessProfile } from "../../lib/advisor/profile";

const keyFor = (userCode?: string) => `vizion_business_profile_${(userCode || "guest").toLowerCase()}`;

function read(userCode?: string): BusinessProfile {
  try {
    return sanitizeProfile(JSON.parse(localStorage.getItem(keyFor(userCode)) || "{}"));
  } catch {
    return {};
  }
}

export function useBusinessProfile(userCode?: string) {
  const [profile, setProfile] = useState<BusinessProfile>(() => (typeof window === "undefined" ? {} : read(userCode)));

  useEffect(() => {
    setProfile(read(userCode));
  }, [userCode]);

  const save = useCallback(
    (next: BusinessProfile) => {
      const clean = sanitizeProfile(next);
      setProfile(clean);
      try {
        localStorage.setItem(keyFor(userCode), JSON.stringify(clean));
      } catch {
      }
    },
    [userCode]
  );

  const merge = useCallback(
    (update: BusinessProfile): (keyof BusinessProfile)[] => {
      const current = read(userCode);
      const changed = (Object.keys(update) as (keyof BusinessProfile)[]).filter((k) => update[k] !== undefined && update[k] !== current[k]);
      if (changed.length) save({ ...current, ...update });
      return changed;
    },
    [save, userCode]
  );

  return { profile, save, merge };
}
