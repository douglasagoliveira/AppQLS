import { KitSelection, Project, Room, SelectedRoomItem } from '../types';
import { isLightSource } from './catalog';
import { kitSubtotal } from './kitEngine';

export interface BomLine {
  space: string;
  role: 'luminaire' | KitSelection['role'];
  required: boolean;
  sku: string;
  name: string;
  finish?: string;
  qty: number;
  unit: 'pc' | 'm';
  unitPrice: number;
  subtotal: number;
}

export interface ProjectTotals {
  /** Luminaire pieces (excludes items sold by the metre). */
  pieces: number;
  /** Metros lineares (fitas, neon, wall washer). */
  linearMetres: number;
  watts: number;
  cost: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Total cost of an item: luminaire/light source + kit components. */
export function itemTotalCost(item: SelectedRoomItem): number {
  return round2(item.subtotal + kitSubtotal(item.kit));
}

/** BOM lines for an item (light source + kit). */
export function itemBomLines(space: string, item: SelectedRoomItem): BomLine[] {
  const lines: BomLine[] = [
    {
      space,
      role: 'luminaire',
      required: true,
      sku: item.product.sku,
      name: item.product.name,
      finish: item.selectedFinish,
      qty: item.quantity,
      unit: item.product.unit === 'm' ? 'm' : 'pc',
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    },
  ];
  (item.kit ?? []).forEach((k) =>
    lines.push({
      space,
      role: k.role,
      required: k.required,
      sku: k.product.sku,
      name: k.product.name,
      qty: k.quantity,
      unit: k.product.unit === 'm' ? 'm' : 'pc',
      unitPrice: k.unitPrice,
      subtotal: k.subtotal,
    })
  );
  return lines;
}

export const ADDITIONAL_SPACE_LABEL = 'Additional items';

/** Consolidated project BOM: spaces + loose items from the catalogue. */
export function buildBom(project: Pick<Project, 'rooms' | 'additionalItems'>): BomLine[] {
  const lines: BomLine[] = [];
  project.rooms.forEach((r) => {
    if (r.selectedItem) lines.push(...itemBomLines(r.name, r.selectedItem));
  });
  (project.additionalItems ?? []).forEach((item) => lines.push(...itemBomLines(ADDITIONAL_SPACE_LABEL, item)));
  return lines;
}

/** Project totals. Single source used by the store, PDF and screens. */
export function computeTotals(rooms: Room[], additionalItems: SelectedRoomItem[] = []): ProjectTotals {
  const items: SelectedRoomItem[] = [
    ...rooms.flatMap((r) => (r.selectedItem ? [r.selectedItem] : [])),
    ...additionalItems,
  ];

  let pieces = 0;
  let linearMetres = 0;
  let watts = 0;
  let cost = 0;

  items.forEach((it) => {
    if (it.product.unit === 'm') linearMetres += it.quantity;
    else if (isLightSource(it.product)) pieces += it.quantity;
    watts += it.quantity * it.product.powerWatts;
    cost += itemTotalCost(it);
  });

  return {
    pieces,
    linearMetres: round2(linearMetres),
    watts: Math.round(watts * 10) / 10,
    cost: round2(cost),
  };
}

/** Required kit items that are still undefined (alert before the RFQ). */
export function collectKitGaps(project: Pick<Project, 'rooms' | 'additionalItems'>): { space: string; missing: string[] }[] {
  const gaps: { space: string; missing: string[] }[] = [];
  project.rooms.forEach((r) => {
    if (r.selectedItem?.kitMissing?.length) gaps.push({ space: r.name, missing: r.selectedItem.kitMissing });
  });
  (project.additionalItems ?? []).forEach((it) => {
    if (it.kitMissing?.length) gaps.push({ space: ADDITIONAL_SPACE_LABEL, missing: it.kitMissing });
  });
  return gaps;
}

/** Number of items shown in the Projects tab counter ("My list"). */
export function countListItems(project: Pick<Project, 'rooms' | 'additionalItems'> | null | undefined): number {
  if (!project) return 0;
  return project.rooms.filter((r) => !!r.selectedItem).length + (project.additionalItems?.length ?? 0);
}
