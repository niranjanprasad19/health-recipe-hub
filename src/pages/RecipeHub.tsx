import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHub, seoHubs } from "@/data/seoHubs";
import NotFound from "./NotFound";

const SITE_URL = "https://nutricheff.lovable.app";

export const RecipeHubIndex = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Recipe Guides for Students, NRIs & Indian Diets — NutriChef</title>
      <meta name="description" content="Curated recipe guides: 10-minute hostel meals, Indian food with US grocery ingredients, budget, high-protein veg, Jain and South Indian breakfasts." />
      <link rel="canonical" href={`${SITE_URL}/guides`} />
    </Helmet>
    <Header />
    <main className="container max-w-6xl py-6 sm:py-10">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2">Recipe Guides</h1>
      <p className="text-muted-foreground mb-6 sm:mb-8">Hand-picked collections for students, NRIs and every Indian kitchen.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {seoHubs.map((h) => (
          <Link key={h.slug} to={`/guides/${h.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="text-3xl mb-2">{h.emoji}</div>
                <h2 className="font-semibold text-lg mb-1">{h.h1}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3">{h.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  </div>
);

const RecipeHub = () => {
  const { slug } = useParams();
  const hub = getHub(slug);
  if (!hub) return <NotFound />;
  const url = `${SITE_URL}/guides/${hub.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: hub.h1,
    itemListElement: hub.ideas.map((i, idx) => ({ "@type": "ListItem", position: idx + 1, name: i.name })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{hub.title}</title>
        <meta name="description" content={hub.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={hub.title} />
        <meta property="og:description" content={hub.description} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <main className="container max-w-5xl py-6 sm:py-10">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/guides" className="hover:underline">Guides</Link> / <span>{hub.h1}</span>
        </nav>
        <h1 className="text-2xl sm:text-4xl font-bold mb-3">{hub.emoji} {hub.h1}</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-6">{hub.intro}</p>

        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold mb-3"><Lightbulb className="w-4 h-4 text-primary" /> Quick tips</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
              {hub.tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </CardContent>
        </Card>

        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Recipes to try</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {hub.ideas.map((i) => (
            <Card key={i.name}>
              <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold">{i.name}</h3>
                  <Badge variant="secondary" className="shrink-0"><Clock className="w-3 h-3 mr-1" />{i.time}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{i.why}</p>
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link to={`/quick-recipe?prompt=${encodeURIComponent(i.prompt)}`}>
                    <Sparkles className="w-4 h-4 mr-1.5" /> Generate full recipe
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="font-semibold mb-3">More guides</h2>
          <div className="flex flex-wrap gap-2">
            {seoHubs.filter((h) => h.slug !== hub.slug).map((h) => (
              <Link key={h.slug} to={`/guides/${h.slug}`}>
                <Badge variant="outline" className="py-1.5 px-3">{h.emoji} {h.h1} <ArrowRight className="w-3 h-3 ml-1" /></Badge>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeHub;
