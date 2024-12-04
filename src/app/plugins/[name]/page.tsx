import { SiGithub } from '@icons-pack/react-simple-icons';
import { ArrowLeft, CheckCircle, Clock, Download, RefreshCw, ShieldCheck, Tag } from 'lucide-react';
import Link from 'next/link';

import AppFooter from '@/components/footer';
import GithubPeople from '@/components/github_people';
import { InstallButtons } from '@/components/install';
import ReadmeTab from '@/components/readme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber, formatTimeString, getRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import type { Plugin } from '@/modal/plugin';

async function fetchPlugins(): Promise<Plugin[]> {
  try {
    if (typeof window !== 'undefined') {
      const cachedPlugins = localStorage.getItem('tremPlugins');
      const lastFetch = localStorage.getItem('lastPluginsFetch');
      const now = Date.now();

      if (cachedPlugins && lastFetch && now - parseInt(lastFetch) < 600000) {
        return JSON.parse(cachedPlugins) as Plugin[];
      }
    }

    const response = await fetch(
      'https://raw.githack.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
      { next: { revalidate: 3600 } },
    );

    const pluginsData = await response.json() as Plugin[];

    if (typeof window !== 'undefined') {
      localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
      localStorage.setItem('lastPluginsFetch', Date.now().toString());
    }

    return pluginsData;
  }
  catch (error) {
    console.error('Error fetching plugins:', error);

    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('tremPlugins');
      if (cachedData) {
        return JSON.parse(cachedData) as Plugin[];
      }
    }

    return [];
  }
}

export async function generateStaticParams() {
  const plugins = await fetchPlugins();
  return plugins.map((plugin) => ({
    name: plugin.name,
  }));
}

async function getPluginData(name: string): Promise<Plugin | null> {
  const plugins = await fetchPlugins();
  return plugins.find((plugin) => plugin.name === name) || null;
}

export default async function PluginPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const plugin = await getPluginData(name);
  const isVerified = plugin?.author.includes('ExpTechTW');

  if (!plugin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">找不到擴充</h1>
        <p>
          找不到名為
          {name}
          {' '}
          的擴充。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <main className="container mx-auto min-h-svh flex-1 px-4 py-8">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>返回首頁</span>
            </Link>
          </Button>
        </div>

        <div className={`
          grid grid-cols-1 gap-4
          lg:grid-cols-4
          sm:gap-6
        `}
        >
          <div className={`
            space-y-4
            lg:col-span-1
          `}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-xl font-bold">{plugin.name}</CardTitle>
                  {isVerified && (
                    <div className="flex translate-y-[1px] items-center gap-2">
                      <Badge className={`
                        flex items-center gap-1.5 py-1 text-xs text-green-500
                        dark:text-green-700 dark:hover:bg-green-900/40
                        hover:bg-green-100/80
                      `}
                      >
                        <CheckCircle
                          size={16}
                          className={`
                            text-green-500
                            dark:text-green-700
                          `}
                        />
                        官方製作
                      </Badge>
                      <Badge className={`
                        flex items-center gap-1.5 py-1 text-xs text-blue-500
                        dark:text-blue-700 dark:hover:bg-blue-900/40
                        hover:bg-blue-100/80
                      `}
                      >
                        <ShieldCheck
                          size={16}
                          className={`
                            text-blue-500
                            dark:text-blue-700
                          `}
                        />
                        安全載入
                      </Badge>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {plugin.description.zh_tw}
                  </p>
                  <GithubPeople people={plugin.author} />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className={`
                  grid grid-cols-1 gap-6 border-t pt-4
                  md:grid-cols-2
                `}
                >
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <RefreshCw size={16} className="shrink-0" />
                        <span>資料同步</span>
                      </div>
                      <Tooltip>
                        <TooltipContent>{formatTimeString(plugin.updated_at)}</TooltipContent>
                        <TooltipTrigger>{getRelativeTime(plugin.updated_at)}</TooltipTrigger>
                      </Tooltip>
                    </div>

                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <Tag size={16} className="shrink-0" />
                        <span>最新版本</span>
                      </div>
                      <div>
                        {plugin.repository.releases.releases[0]?.tag_name ?? '無'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <Clock size={16} className="shrink-0" />
                        <span>最後更新</span>
                      </div>
                      {plugin.repository.releases.releases[0]?.published_at
                        ? (
                            <Tooltip>
                              <TooltipContent>{formatTimeString(plugin.repository.releases.releases[0].published_at)}</TooltipContent>
                              <TooltipTrigger>{getRelativeTime(plugin.repository.releases.releases[0].published_at)}</TooltipTrigger>
                            </Tooltip>
                          )
                        : (
                            <div className="ml-6">尚未發布</div>
                          )}
                    </div>

                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <Download size={16} className="shrink-0" />
                        <span>總下載量</span>
                      </div>
                      <div>
                        {formatNumber(plugin.repository.releases.total_downloads)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <Link
                    href={plugin.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex items-center gap-2 text-sm text-muted-foreground
                      transition-colors
                      hover:text-foreground
                    `}
                  >
                    <SiGithub size={16} className="shrink-0" />
                    <span>GitHub</span>
                  </Link>

                  {plugin.repository.releases.releases.length > 0 && (
                    <InstallButtons plugin={plugin} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="readme" className="space-y-4">
              <TabsList>
                <TabsTrigger value="readme">說明</TabsTrigger>
                <TabsTrigger value="versions">版本</TabsTrigger>
                <TabsTrigger value="dependencies">相依性</TabsTrigger>
              </TabsList>

              <TabsContent value="readme">
                <Card>
                  <ReadmeTab plugin={plugin} />
                </Card>
              </TabsContent>

              <TabsContent value="versions">
                <Card>
                  <CardContent className={`
                    p-4
                    sm:p-6
                  `}
                  >
                    <div className="space-y-6">
                      {plugin.repository.releases.releases.map((release) => (
                        <div
                          key={release.tag_name}
                          className={`
                            border-b pb-4
                            last:border-0
                          `}
                        >
                          <div className={`
                            mb-2 flex flex-col gap-2
                            sm:flex-row sm:items-start sm:justify-between
                          `}
                          >
                            <h3 className="font-medium">
                              {release.tag_name}
                              <span className={`
                                block text-sm text-muted-foreground
                                sm:ml-2 sm:inline
                              `}
                              >
                                (
                                {new Date(release.published_at).toLocaleDateString('zh-TW')}
                                )
                              </span>
                            </h3>
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`https://github.com/${plugin.repository.full_name}/releases/download/${release.tag_name}/${plugin.name}.trem`}
                                download
                              >
                                下載
                              </a>
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            下載次數:
                            {' '}
                            {formatNumber(release.downloads)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dependencies">
                <Card>
                  <CardContent className={`
                    p-4
                    sm:p-6
                  `}
                  >
                    <div className={`
                      grid grid-cols-1 gap-4
                      sm:grid-cols-2
                    `}
                    >
                      {Object.entries(plugin.dependencies).map(([key, value]) => (
                        <div key={key} className="rounded-lg border p-4">
                          <div className="break-words font-medium">{key}</div>
                          <div className={`
                            break-words text-sm text-muted-foreground
                          `}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <AppFooter>
        <div className={`
          flex flex-col justify-between gap-2
          md:flex-row
        `}
        >
          <div>&copy; 2024 ExpTech Ltd.</div>
        </div>
      </AppFooter>
    </div>
  );
}
