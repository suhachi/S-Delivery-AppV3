# simple-delivery-app - Volume 06

Generated: 2025-12-23 19:23:29
Project Path: D:\projectsing\hyun-poong\simple-delivery-app\

- Files in volume: 19
- Approx size: 0.07 MB

---

## File: functions\.eslintrc.js

```javascript
module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
  },
};


```

---

## File: scripts\compare_projects_integrity.mjs

```javascript

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DIR_A = String.raw`D:\projectsing\S-Delivery-App`;
const DIR_B = String.raw`d:\projectsing\hyun-poong\simple-delivery-app`;

const IGNORE_LIST = [
    '.git',
    '.firebase',
    'node_modules',
    'build',
    'dist',
    '.DS_Store',
    'coverage',
    '.vscode',
    'generated-code-docs', // Documentation generation artifacts might differ
    'project-code-docs' // Documentation generation artifacts might differ
];

function getFileHash(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
}

function scanDirectory(dir, rootDir) {
    let results = {};
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (IGNORE_LIST.includes(item.name)) continue;

        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(rootDir, fullPath);

        if (item.isDirectory()) {
            Object.assign(results, scanDirectory(fullPath, rootDir));
        } else {
            results[relativePath] = getFileHash(fullPath);
        }
    }
    return results;
}

console.log(`[Comparison Started]`);
console.log(`Source A: ${DIR_A}`);
console.log(`Source B: ${DIR_B}`);
console.log('Scanning...');

try {
    const filesA = scanDirectory(DIR_A, DIR_A);
    const filesB = scanDirectory(DIR_B, DIR_B);

    const allFiles = new Set([...Object.keys(filesA), ...Object.keys(filesB)]);
    const differences = [];
    const missingInA = [];
    const missingInB = [];

    for (const file of allFiles) {
        const hashA = filesA[file];
        const hashB = filesB[file];

        if (!hashA) {
            missingInA.push(file);
        } else if (!hashB) {
            missingInB.push(file);
        } else if (hashA !== hashB) {
            differences.push(file);
        }
    }

    console.log('\n--- Comparison Result ---');

    if (missingInA.length === 0 && missingInB.length === 0 && differences.length === 0) {
        console.log('✅ projects are 100% IDENTICAL (excluding ignored folders).');
    } else {
        console.log(`⚠️  Projects are NOT identical.`);

        if (differences.length > 0) {
            console.log(`\n[Modified Files] (${differences.length} files):`);
            differences.forEach(f => console.log(` - ${f}`));
        }

        if (missingInB.length > 0) {
            console.log(`\n[Missing in Current Project (${DIR_B})] (${missingInB.length} files):`);
            missingInB.forEach(f => console.log(` - ${f}`));
        }

        if (missingInA.length > 0) {
            console.log(`\n[Extra Files in Current Project (Not in Source)] (${missingInA.length} files):`);
            missingInA.forEach(f => console.log(` - ${f}`));
        }
    }

} catch (e) {
    console.error('Error during comparison:', e);
}

```

---

## File: src\components\common\Card.tsx

```typescript
import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export default function Card({
  hover = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

```

---

## File: src\components\menu\MenuCard.tsx

```typescript
import { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Menu } from '../../types/menu';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import MenuDetailModal from './MenuDetailModal';

interface MenuCardProps {
  menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {
  const { addItem } = useCart();
  const [showDetail, setShowDetail] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (menu.soldout) {
      toast.error('품절된 메뉴입니다');
      return;
    }

    if (menu.options && menu.options.length > 0) {
      // 옵션이 있으면 상세 모달 열기
      setShowDetail(true);
    } else {
      // 옵션이 없으면 바로 추가
      addItem({
        menuId: menu.id,
        name: menu.name,
        price: menu.price,
        quantity: 1,
        imageUrl: menu.imageUrl,
      });
      toast.success('장바구니에 추가되었습니다');
    }
  };

  return (
    <>
      <Card
        hover
        padding="none"
        onClick={() => setShowDetail(true)}
        className={`overflow-hidden ${menu.soldout ? 'opacity-60' : ''}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 group">
          {menu.imageUrl ? (
            <img
              src={menu.imageUrl}
              alt={menu.name}
              className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-5xl">🍜</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {menu.category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="primary" size="sm">
                {cat}
              </Badge>
            ))}
          </div>

          {menu.soldout && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="danger" size="lg">
                품절
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {menu.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {menu.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {menu.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600 ml-1">원</span>
            </div>

            <Button
              size="sm"
              onClick={handleQuickAdd}
              disabled={menu.soldout}
              className="group"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              담기
            </Button>
          </div>

          {menu.options && menu.options.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {menu.options.length}개의 옵션 선택 가능
            </p>
          )}
        </div>
      </Card>

      {showDetail && (
        <MenuDetailModal
          menu={menu}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}

```

---

## File: src\components\ui\carousel.tsx

```typescript
"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react@8.6.0";
import { ArrowLeft, ArrowRight } from "lucide-react@0.487.0";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

```

---

## File: src\components\ui\chart.tsx

```typescript
"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts@2.15.2";

import { cn } from "./utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

```

---

## File: src\components\ui\command.tsx

```typescript
"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk@1.1.1";
import { SearchIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

```

---

## File: src\components\ui\context-menu.tsx

```typescript
"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu@2.2.6";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

```

---

## File: src\components\ui\skeleton.tsx

```typescript
import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };

```

---

## File: src\components\ui\table.tsx

```typescript
"use client";

import * as React from "react";

import { cn } from "./utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

```

---

## File: src\devtools\safeSnapshot.ts

```typescript
import { Query, onSnapshot, DocumentReference } from 'firebase/firestore';

/**
 * onSnapshot의 안전한 래퍼
 * - 권한 에러 시 조용히 실패
 * - enabled 옵션으로 구독 제어
 * - 에러 시 console.warn으로 로깅
 */
export function onSnapshotSafe<T = any>(
  query: Query<T> | DocumentReference<T>,
  callback: (snapshot: any) => void,
  options?: {
    enabled?: boolean;
    onError?: (error: Error) => void;
  }
) {
  const enabled = options?.enabled !== false;

  if (!enabled) {
    // 구독하지 않고 빈 unsubscribe 함수 반환
    return () => {};
  }

  try {
    return onSnapshot(
      query,
      callback,
      (error) => {
        // 권한 에러는 경고만 출력
        if (error.code === 'permission-denied') {
          console.warn('[safeSnapshot] 권한 없음:', error.message);
        } else {
          console.warn('[safeSnapshot] 에러 발생:', error);
        }

        // 커스텀 에러 핸들러 호출
        if (options?.onError) {
          options.onError(error);
        }
      }
    );
  } catch (error) {
    console.warn('[safeSnapshot] 구독 실패:', error);
    return () => {};
  }
}

export default onSnapshotSafe;

```

---

## File: src\hooks\useFirestoreDocument.ts

```typescript
import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UseFirestoreDocumentResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFirestoreDocument<T extends DocumentData>(
  collectionName: string | string[],
  documentId: string | null | undefined
): UseFirestoreDocumentResult<T> {
  // 안정적인 의존성 키 생성 (배열인 경우 문자열로 결합)
  const collectionPath = Array.isArray(collectionName)
    ? collectionName.join('/')
    : collectionName;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // collectionPath(문자열)를 사용하여 참조 생성
      const docRef = doc(db, collectionPath, documentId);

      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData({
              id: snapshot.id,
              ...snapshot.data(),
            } as T);
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Firestore document error (${collectionPath}/${documentId}):`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionPath, documentId]); // 안정된 문자열 키 사용

  return { data, loading, error };
}

```

---

## File: src\lib\firestorePaths.ts

```typescript
/**
 * Firestore 경로 헬퍼
 * 멀티 테넌트 데이터 격리를 위한 경로 생성 유틸리티
 * 
 * 기존: collection(db, 'menus')
 * 변경: collection(db, getMenusPath(storeId))
 */

/**
 * 상점별 메뉴 경로
 * stores/{storeId}/menus
 */
export function getMenusPath(storeId: string): string {
  return `stores/${storeId}/menus`;
}

/**
 * 상점별 주문 경로
 * stores/{storeId}/orders
 */
export function getOrdersPath(storeId: string): string {
  return `stores/${storeId}/orders`;
}

/**
 * 상점별 쿠폰 경로
 * stores/{storeId}/coupons
 */
export function getCouponsPath(storeId: string): string {
  return `stores/${storeId}/coupons`;
}

/**
 * 상점별 리뷰 경로
 * stores/{storeId}/reviews
 */
export function getReviewsPath(storeId: string): string {
  return `stores/${storeId}/reviews`;
}

/**
 * 상점별 공지사항 경로
 * stores/{storeId}/notices
 */
export function getNoticesPath(storeId: string): string {
  return `stores/${storeId}/notices`;
}

/**
 * 상점별 이벤트 경로
 * stores/{storeId}/events
 */
export function getEventsPath(storeId: string): string {
  return `stores/${storeId}/events`;
}

/**
 * 상점별 사용 쿠폰 경로
 * stores/{storeId}/couponUsages
 */
export function getCouponUsagesPath(storeId: string): string {
  return `stores/${storeId}/couponUsages`;
}

/**
 * 모든 경로를 한 번에 가져오기
 */
export function getStorePaths(storeId: string) {
  return {
    menus: getMenusPath(storeId),
    orders: getOrdersPath(storeId),
    coupons: getCouponsPath(storeId),
    reviews: getReviewsPath(storeId),
    notices: getNoticesPath(storeId),
    events: getEventsPath(storeId),
    couponUsages: getCouponUsagesPath(storeId),
  };
}

```

---

## File: src\pages\admin\AdminOrderManagement.tsx

```typescript
import { useState, useEffect } from 'react';
import { Package, MapPin, Phone, CreditCard, ChevronDown } from 'lucide-react';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_TYPE_LABELS } from '../../types/order';
import { toast } from 'sonner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useStore } from '../../contexts/StoreContext';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { updateOrderStatus, deleteOrder, getAllOrdersQuery } from '../../services/orderService';
import AdminOrderAlert from '../../components/admin/AdminOrderAlert';
import { getNextStatus } from '../../utils/orderUtils';

// 헬퍼 함수: Firestore Timestamp 처리를 위한 toDate
function toDate(date: any): Date {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  return new Date();
}

import Receipt from '../../components/admin/Receipt';

export default function AdminOrderManagement() {
  const { store } = useStore();
  const [filter, setFilter] = useState<OrderStatus | '전체'>('전체');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Firestore에서 주문 조회 (삭제되지 않은 주문만)
  const { data: allOrders } = useFirestoreCollection<Order>(
    store?.id ? getAllOrdersQuery(store.id) : null
  );

  const filteredOrders = filter === '전체'
    ? (allOrders || []).filter(order => order.status !== '결제대기')
    : (allOrders || []).filter(order => order.status === filter);

  // 필터 순서 업데이트 (조리완료, 포장완료 추가)
  const filters: (OrderStatus | '전체')[] = ['전체', '접수', '접수완료', '조리중', '조리완료', '배달중', '포장완료', '완료', '취소'];

  // 인쇄를 위한 Effect Hooks (상태 변경 감지 후 실행)
  useEffect(() => {
    if (printOrder) {
      // 1. 현재 타이틀 저장
      const originalTitle = document.title;

      // 2. 파일명 생성을 위한 날짜 포맷팅 (YYYYMMDD_HHmm_OrderID)
      // Firestore Timestamp vs Date 객체 호환 처리
      const createdAt = printOrder.createdAt as any;
      let d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);

      // Date 객체가 유효하지 않은 경우 현재 시간으로 대체
      if (isNaN(d.getTime())) {
        d = new Date();
      }

      const dateStr = d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0') + '_' +
        String(d.getHours()).padStart(2, '0') +
        String(d.getMinutes()).padStart(2, '0');

      // 안전한 파일명 생성 (특수문자 제거)
      const safeId = (printOrder.id || 'unknown').slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
      const newTitle = `${dateStr}_${safeId}`;

      document.title = newTitle;
      console.log('Printing with title:', newTitle); // 디버깅용

      // 3. 인쇄 실행
      // 브라우저 인쇄가 끝나면(취소 혹은 출력) 실행될 핸들러
      const handleAfterPrint = () => {
        document.title = originalTitle;
        setPrintOrder(null); // 상태 초기화
        window.removeEventListener('afterprint', handleAfterPrint);
      };

      window.addEventListener('afterprint', handleAfterPrint);

      // 렌더링 확보를 위한 짧은 지연 후 인쇄
      const printTimer = setTimeout(() => {
        window.print();
      }, 500);

      // 컴포넌트 언마운트 시 안전장치
      return () => {
        clearTimeout(printTimer);
        window.removeEventListener('afterprint', handleAfterPrint);
        document.title = originalTitle; // 혹시 모를 상황 대비 복구
      };
    }
  }, [printOrder]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (!store?.id) return;
    try {
      await updateOrderStatus(store.id, orderId, newStatus);
      toast.success(`주문 상태가 '${ORDER_STATUS_LABELS[newStatus]}'(으)로 변경되었습니다`);

      // 주문 접수(확인) 시 영수증 자동 출력
      // 2024-12-10: 사용자 요청으로 자동 출력 기능 다시 활성화
      if (newStatus === '접수완료') {
        const targetOrder = allOrders?.find(o => o.id === orderId);
        if (targetOrder) {
          // 인쇄용 상태 업데이트 -> useEffect 트리거
          setPrintOrder(targetOrder);
        }
      }

    } catch (error: any) {
      console.error(error);
      if (error?.code === 'permission-denied') {
        toast.error('주문 상태를 변경할 권한이 없습니다.');
      } else {
        toast.error('주문 상태 변경에 실패했습니다');
      }
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!store?.id) return;
    if (!window.confirm('정말로 이 주문을 삭제하시겠습니까? \n삭제된 주문은 복구할 수 없으며, 고객의 주문 내역에서도 사라집니다.')) return;

    try {
      await deleteOrder(store.id, orderId);
      toast.success('주문이 삭제되었습니다');
    } catch (error) {
      console.error(error);
      toast.error('주문 삭제에 실패했습니다');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar className="print:hidden" />

      {/* 영수증 컴포넌트 (평소엔 숨김, 인쇄 시에만 등장) */}
      <Receipt order={printOrder} store={store} />

      <main className="flex-1 p-8 print:hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                주문 관리
              </span>
            </h1>
            <p className="text-gray-600">총 {filteredOrders.length}개의 주문</p>
          </div>

          {/* Status Filter */}
          <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filters.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0
                  ${filter === status
                    ? 'gradient-primary text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
                  }
                `}
              >
                {status === '전체' ? '전체' : ORDER_STATUS_LABELS[status]}
                <span className="ml-2 text-xs opacity-75">
                  ({(allOrders || []).filter(o => status === '전체' || o.status === status).length})
                </span>
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggleExpand={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onPrint={() => setPrintOrder(order)}
                />
              ))
            ) : (
              <Card className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-600">주문이 없습니다</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
  onPrint: () => void;
}

function OrderCard({ order, isExpanded, onToggleExpand, onStatusChange, onDelete, onPrint }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status as OrderStatus];
  // getNextStatus 업데이트 (order 객체 전달)
  const nextStatus = getNextStatus(order);
  const [Printer] = useState(() => import('lucide-react').then(mod => mod.Printer)); // Dynamic import or just use lucide-react if already imported

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statusColor.bg} flex-shrink-0`}>
              <Package className={`w-7 h-7 ${statusColor.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-bold text-gray-900">주문 #{order.id.slice(0, 8)}</h3>
                <Badge
                  variant={
                    order.status === '완료' ? 'success' :
                      order.status === '취소' ? 'danger' :
                        order.status === '배달중' ? 'secondary' :
                          'primary'
                  }
                >
                  {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {order.items.length}개 상품 · {order.totalPrice.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500">
                {toDate(order.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-gray-200 space-y-4 animate-fade-in">
          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">주문 상품</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const optionsPrice = item.options?.reduce((sum, opt) => sum + (opt.price * (opt.quantity || 1)), 0) || 0;
                return (
                  <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3 flex-1">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.options && item.options.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {item.options.map(opt => `${opt.name}${(opt.quantity || 1) > 1 ? ` x${opt.quantity}` : ''} (+${(opt.price * (opt.quantity || 1)).toLocaleString()}원)`).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">수량: {item.quantity}개</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 flex-shrink-0 ml-4">
                      {((item.price + optionsPrice) * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">배달 정보</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{order.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{order.phone}</span>
                </div>
                {order.memo && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                    💬 {order.memo}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">결제 정보</h4>
              <div className="flex items-center space-x-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{PAYMENT_TYPE_LABELS[order.paymentType]}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">총 결제 금액</p>
                <p className="text-2xl font-bold text-blue-600">{order.totalPrice.toLocaleString()}원</p>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {order.status !== '완료' && order.status !== '취소' && order.status !== '포장완료' && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-3">주문 상태 변경</h4>
                    <div className="flex gap-2">
                      {nextStatus && (
                        <Button
                          onClick={() => onStatusChange(order.id, nextStatus)}
                        >
                          다음 단계로 ({ORDER_STATUS_LABELS[nextStatus]})
                        </Button>
                      )}

                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('주문을 취소하시겠습니까?')) {
                            onStatusChange(order.id, '취소');
                          }
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* 영수증 인쇄 버튼 (항상 표시 or 특정 상태에서만? 사용자는 그냥 '추가'라고 함) */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrint();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* 아이콘은 상단 import 사용 */}
                  <span>🖨️ 영수증 인쇄</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Button for Completed/Cancelled Orders */}
          {(order.status === '완료' || order.status === '취소' || order.status === '포장완료') && (
            <div className="pt-4 border-t border-gray-200 text-right">
              <Button
                variant="outline"
                onClick={() => onDelete(order.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                주문 내역 삭제
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
```

---

## File: src\pages\EventsPage.tsx

```typescript
import { Gift } from 'lucide-react';
import EventList from '../components/event/EventList';

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                이벤트
                            </span>
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        놓치지 마세요! 현재 진행 중인 다양한 혜택
                    </p>
                </div>

                {/* Event List */}
                <EventList />
            </div>
        </div>
    );
}

```

---

## File: src\pages\OrderDetailPage.test.tsx

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderDetailPage from './OrderDetailPage';
import { useStore } from '../contexts/StoreContext';
import { useFirestoreDocument } from '../hooks/useFirestoreDocument';
import { useParams, useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

vi.mock('../contexts/StoreContext', () => ({
    useStore: vi.fn(),
}));

vi.mock('../hooks/useFirestoreDocument', () => ({
    useFirestoreDocument: vi.fn(),
}));

vi.mock('../components/common/Card', () => ({
    default: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

// Mock lucide icons
vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>ArrowLeft</span>,
    MapPin: () => <span>MapPin</span>,
    Phone: () => <span>Phone</span>,
    CreditCard: () => <span>CreditCard</span>,
    Clock: () => <span>Clock</span>,
    Package: () => <span>Package</span>,
    CheckCircle2: () => <span>CheckCircle2</span>,
    MessageSquare: () => <span>MessageSquare</span>,
    AlertCircle: () => <span>AlertCircle</span>,
}));

describe('OrderDetailPage', () => {
    const mockNavigate = vi.fn();
    const mockStore = { id: 'store_1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useStore as any).mockReturnValue({ store: mockStore });
        (useParams as any).mockReturnValue({ orderId: 'order_123' });
    });

    it('should render loading state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: true,
            error: null
        });

        render(<OrderDetailPage />);
        expect(screen.getByText('주문 정보를 불러오는 중...')).toBeInTheDocument();
    });

    it('should render error/not found state', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: null,
            loading: false,
            error: new Error('Failed')
        });

        render(<OrderDetailPage />);
        // Component renders one of these
        expect(screen.getByText('주문 정보를 불러오는데 실패했습니다')).toBeInTheDocument();
    });

    it('should render order details when loaded', () => {
        const mockOrder = {
            id: 'order_123',
            status: '접수',
            totalPrice: 15000,
            items: [
                { name: 'Pizza', price: 15000, quantity: 1, options: [] }
            ],
            createdAt: { toDate: () => new Date('2024-01-01T12:00:00') },
            address: 'Seoul Grid',
            phone: '010-1234-5678',
            paymentType: 'card',
            orderType: '배달'
        };

        (useFirestoreDocument as any).mockReturnValue({
            data: mockOrder,
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        expect(screen.getByText('주문 상세')).toBeInTheDocument();
        expect(screen.getByText('주문번호: order_12')).toBeInTheDocument();
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        // Price appears multiple times, check at least one
        expect(screen.getAllByText('15,000원').length).toBeGreaterThan(0);
    });

    it('should navigate back when button clicked', () => {
        (useFirestoreDocument as any).mockReturnValue({
            data: { id: '1', status: '접수', items: [], totalPrice: 0, createdAt: new Date() },
            loading: false,
            error: null
        });

        render(<OrderDetailPage />);

        const backButton = screen.getByText('주문 목록으로');
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/orders');
    });
});

```

---

## File: src\services\couponService.ts

```typescript
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Coupon } from '../types/coupon';

// 컬렉션 참조 헬퍼 (stores/{storeId}/coupons)
const getCouponCollection = (storeId: string) => collection(db, 'stores', storeId, 'coupons');

// 쿠폰 생성
export async function createCoupon(storeId: string, couponData: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) {
  try {
    const docRef = await addDoc(getCouponCollection(storeId), {
      ...couponData,
      usedCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('쿠폰 생성 실패:', error);
    throw error;
  }
}

// 쿠폰 수정
export async function updateCoupon(storeId: string, couponId: string, couponData: Partial<Coupon>) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      ...couponData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 수정 실패:', error);
    throw error;
  }
}

// 쿠폰 삭제
export async function deleteCoupon(storeId: string, couponId: string) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error('쿠폰 삭제 실패:', error);
    throw error;
  }
}

// 쿠폰 활성화/비활성화
export async function toggleCouponActive(storeId: string, couponId: string, isActive: boolean) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('쿠폰 상태 변경 실패:', error);
    throw error;
  }
}

// 쿠폰 사용
export async function useCoupon(storeId: string, couponId: string, userId: string) {
  try {
    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      usedCount: increment(1),
      usedByUserIds: arrayUnion(userId)
    });
  } catch (error) {
    console.error('쿠폰 사용 처리 실패:', error);
    throw error;
  }
}

// Query 헬퍼 함수들
export function getAllCouponsQuery(storeId: string) {
  return query(
    getCouponCollection(storeId),
    orderBy('createdAt', 'desc')
  );
}

export function getActiveCouponsQuery(storeId: string) {
  return query(
    getCouponCollection(storeId),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
}
```

---

## File: src\types\global.d.ts

```typescript
export { };

declare global {
    interface Window {
        AUTHNICE?: {
            requestPay: (params: NicepayRequestParams) => void;
        };
    }
}

export interface NicepayRequestParams {
    clientId: string;
    method: string;
    orderId: string;
    amount: number;
    goodsName: string;
    returnUrl: string;
    fnError?: (result: any) => void; // 결제 실패 시 콜백
    // 필요한 경우 추가 필드 정의
    buyerName?: string;
    buyerEmail?: string;
    buyerTel?: string;
    mallReserved?: string; // 상점 예비정보
}

export interface NicepaySuccessResult {
    resultCode: string;
    resultMsg: string;
    authResultCode: string;
    authResultMsg: string;
    tid: string;
    clientId: string;
    orderId: string;
    amount: number;
    mallReserved?: string;
    authToken: string; // 승인 요청 시 필요
    signature: string; // 위변조 검증
}

```

---

## File: src\utils\orderUtils.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { getNextStatus } from './orderUtils';
import { Order } from '../types/order';

describe('orderUtils', () => {
    describe('getNextStatus', () => {
        const baseOrder = {
            id: '1',
            userId: 'user1',
            status: '접수',
            totalPrice: 10000,
            createdAt: new Date(),
            items: [],
            storeId: 'store1',
            paymentType: 'card',
            address: 'Seoul',
            phone: '010-0000-0000'
        } as Order;

        it('should return next status for delivery flow', () => {
            const order = { ...baseOrder, orderType: '배달' };

            expect(getNextStatus({ ...order, status: '접수' })).toBe('접수완료');
            expect(getNextStatus({ ...order, status: '접수완료' })).toBe('조리중');
            expect(getNextStatus({ ...order, status: '조리중' })).toBe('배달중');
            expect(getNextStatus({ ...order, status: '배달중' })).toBe('완료');
            expect(getNextStatus({ ...order, status: '완료' })).toBeNull();
        });

        it('should return next status for pickup flow', () => {
            const order = { ...baseOrder, orderType: '포장주문' };

            expect(getNextStatus({ ...order, status: '접수' })).toBe('접수완료');
            expect(getNextStatus({ ...order, status: '접수완료' })).toBe('조리중');
            expect(getNextStatus({ ...order, status: '조리중' })).toBe('조리완료'); // 포장엔 조리완료 있음
            expect(getNextStatus({ ...order, status: '조리완료' })).toBe('포장완료');
            expect(getNextStatus({ ...order, status: '포장완료' })).toBeNull(); // 포장완료가 끝? or 완료?
            // AdminOrderManagement.tsx logic: ['접수', '접수완료', '조리중', '조리완료', '포장완료']
            // So '포장완료' next is null.
        });

        it('should return null for invalid status', () => {
            const order = { ...baseOrder, status: 'unknown' as any };
            expect(getNextStatus(order)).toBeNull();
        });
    });
});

```

---

