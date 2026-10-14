import {
  itemTotalCost,
  itemBomLines,
  buildBom,
  computeTotals,
  collectKitGaps,
  countListItems,
  ADDITIONAL_SPACE_LABEL,
} from '../lib/projectMath';
import { PRODUCT_CATALOG } from '../lib/catalog';
import { Project, Room, SelectedRoomItem } from '../types';

describe('projectMath', () => {
  const downlight = PRODUCT_CATALOG.find((p) => p.sku === 'QLS-DL90-12W-3K')!;
  const cobStrip = PRODUCT_CATALOG.find((p) => p.sku === 'LEDYI-REF-COB-24V-10W')!;
  const driver = PRODUCT_CATALOG.find((p) => p.sku === 'LEDYI-REF-DRV-24V-60W')!;

  const sampleLuminaireItem: SelectedRoomItem = {
    id: 'item-1',
    roomId: 'r1',
    product: downlight,
    tierType: 'recommended',
    quantity: 4,
    selectedFinish: 'Matte Black',
    unitPrice: 120,
    subtotal: 480,
    luxAchieved: 320,
  };

  const sampleStripItem: SelectedRoomItem = {
    id: 'item-2',
    roomId: 'r1',
    product: cobStrip,
    tierType: 'recommended',
    quantity: 5, // 5 meters
    selectedFinish: 'Standard',
    unitPrice: 28,
    subtotal: 140,
    luxAchieved: 250,
    kit: [
      {
        role: 'driver',
        required: true,
        product: driver,
        quantity: 1,
        unitPrice: 65,
        subtotal: 65,
        note: 'Driver 75W',
      },
    ],
    kitMissing: ['profile'],
  };

  test('itemTotalCost sums item subtotal and kit subtotals', () => {
    expect(itemTotalCost(sampleLuminaireItem)).toBe(480);
    expect(itemTotalCost(sampleStripItem)).toBe(140 + 65);
  });

  test('itemBomLines generates luminaire row plus kit lines', () => {
    const lines = itemBomLines('Living Room', sampleStripItem);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      space: 'Living Room',
      role: 'luminaire',
      sku: cobStrip.sku,
      unit: 'm',
      qty: 5,
      subtotal: 140,
    });
    expect(lines[1]).toMatchObject({
      space: 'Living Room',
      role: 'driver',
      sku: driver.sku,
      unit: 'pc',
      qty: 1,
      subtotal: 65,
    });
  });

  const createTestRoom = (overrides: Partial<Room>): Room => ({
    id: 'r1',
    projectId: 'p1',
    name: 'Space',
    roomType: 'living_room',
    length: 5,
    width: 4,
    height: 2.8,
    targetLux: 200,
    requiredLumens: 4000,
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  test('buildBom consolidates rooms and additional items', () => {
    const project: Pick<Project, 'rooms' | 'additionalItems'> = {
      rooms: [
        createTestRoom({
          id: 'r1',
          name: 'Office',
          roomType: 'home_office',
          length: 5,
          width: 4,
          height: 2.8,
          targetLux: 320,
          ceilingType: 'plasterboard',
          selectedItem: sampleLuminaireItem,
        }),
      ],
      additionalItems: [sampleStripItem],
    };

    const bom = buildBom(project);
    expect(bom.length).toBe(3); // 1 luminaire from room, 1 strip + 1 driver from additionalItems
    expect(bom.some((b) => b.space === 'Office')).toBe(true);
    expect(bom.some((b) => b.space === ADDITIONAL_SPACE_LABEL)).toBe(true);
  });

  test('computeTotals separates pieces and linearMetres and computes watts & cost', () => {
    const rooms: Room[] = [
      createTestRoom({
        id: 'r1',
        name: 'Office',
        roomType: 'home_office',
        length: 5,
        width: 4,
        height: 2.8,
        targetLux: 320,
        ceilingType: 'plasterboard',
        selectedItem: sampleLuminaireItem, // 4 pcs, 15W each = 60W, cost 480
      }),
    ];
    // additional item: strip 5m, 14W/m = 70W, cost 140 + 65 = 205
    const totals = computeTotals(rooms, [sampleStripItem]);

    expect(totals.pieces).toBe(4);
    expect(totals.linearMetres).toBe(5);
    expect(totals.watts).toBe(4 * downlight.powerWatts + 5 * cobStrip.powerWatts);
    expect(totals.cost).toBe(480 + 205);
  });

  test('collectKitGaps collects missing kit requirements', () => {
    const project: Pick<Project, 'rooms' | 'additionalItems'> = {
      rooms: [
        createTestRoom({
          id: 'r1',
          name: 'Bedroom',
          roomType: 'bedroom',
          length: 4,
          width: 4,
          height: 2.7,
          targetLux: 150,
          ceilingType: 'plasterboard',
          selectedItem: sampleStripItem, // kitMissing: ['profile']
        }),
      ],
      additionalItems: [],
    };
    const gaps = collectKitGaps(project);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].space).toBe('Bedroom');
    expect(gaps[0].missing).toContain('profile');
  });

  test('countListItems counts rooms with selectedItem plus additionalItems', () => {
    expect(countListItems(null)).toBe(0);
    const proj: Pick<Project, 'rooms' | 'additionalItems'> = {
      rooms: [
        createTestRoom({
          id: 'r1',
          name: 'Kitchen',
          roomType: 'kitchen',
          length: 4,
          width: 3,
          height: 2.7,
          targetLux: 300,
          ceilingType: 'plasterboard',
          selectedItem: sampleLuminaireItem,
        }),
        createTestRoom({
          id: 'r2',
          name: 'Hallway',
          roomType: 'living_room',
          length: 6,
          width: 1.5,
          height: 2.7,
          targetLux: 100,
          ceilingType: 'plasterboard',
          selectedItem: null,
        }),
      ],
      additionalItems: [sampleStripItem],
    };
    expect(countListItems(proj)).toBe(2);
  });
});
