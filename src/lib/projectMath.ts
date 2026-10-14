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
  /** Peças de luminárias (exclui itens vendidos por metro). */
  pieces: number;
  /** Metros lineares (fitas, neon, wall washer). */
  linearMetres: number;
  watts: number;
  cost: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Custo total de um item: luminária/fonte + componentes do kit. */
export function itemTotalCost(item: SelectedRoomItem): number {
  return round2(item.subtotal + kitSubtotal(item.kit));
}

/** Linhas de BOM de um item (fonte de luz + kit). */
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

/** BOM consolidada do projeto: ambientes + itens avulsos do catálogo. */
export function buildBom(project: Pick<Project, 'rooms' | 'additionalItems'>): BomLine[] {
  const lines: BomLine[] = [];
  project.rooms.forEach((r) => {
    if (r.selectedItem) lines.push(...itemBomLines(r.name, r.selectedItem));
  });
  (project.additionalItems ?? []).forEach((item) => lines.push(...itemBomLines(ADDITIONAL_SPACE_LABEL, item)));
  return lines;
}

/** Totais do projeto. Fonte única usada pela store, PDF e telas. */
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

/** Itens obrigatórios do kit que ainda não foram definidos (alerta antes do RFQ). */
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

/** Quantidade de itens exibida no contador da aba Projetos ("My list"). */
export function countListItems(project: Pick<Project, 'rooms' | 'additionalItems'> | null | undefined): number {
  if (!project) return 0;
  return project.rooms.filter((r) => !!r.selectedItem).length + (project.additionalItems?.length ?? 0);
}
