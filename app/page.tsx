import { Page } from "@/components/site/Page";
import { Clocktower } from "@/components/clocktower/Clocktower";
import { towerData } from "@/components/clocktower/data";
import { HomeSwitch } from "@/components/landing/HomeSwitch";
import { Landing } from "@/components/landing/Landing";
import { landingData } from "@/components/landing/data";
import { ACCOUNTS } from "@/lib/supabase/project";

// Home is the Clocktower. On GitHub Pages with accounts, learning needs an account, so anyone
// signed out gets the landing page here instead (it's also at /about for everyone). Without
// accounts, everyone goes straight in, with their progress kept in the browser.
export default function Home() {
  const { acts, placements, names, steps } = towerData();
  const tower = <Clocktower acts={acts} placements={placements} names={names} steps={steps} />;
  return <Page>{ACCOUNTS ? <HomeSwitch landing={<Landing data={landingData()} />} tower={tower} /> : tower}</Page>;
}
