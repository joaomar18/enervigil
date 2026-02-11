import { NodePhase, NodeCategory } from "$lib/types/nodes/base";
import type { RealTimeCardCategoriesState } from "$lib/types/view/device";


export function assignRealTimeCardCategoriesStateToAllPhases(state: RealTimeCardCategoriesState): Record<NodePhase, RealTimeCardCategoriesState> {
    return {
        [NodePhase.L1]: { ...state },
        [NodePhase.L2]: { ...state },
        [NodePhase.L3]: { ...state },
        [NodePhase.TOTAL]: { ...state },
        [NodePhase.GENERAL]: { ...state },
        [NodePhase.SINGLEPHASE]: { ...state },
    } as Record<NodePhase, RealTimeCardCategoriesState>;
}


export function createEmptyRealTimeCardCategoryArrays(): Record<NodeCategory, Array<any>> {
    return {
        [NodeCategory.Measurements]: [],
        [NodeCategory.Counters]: [],
        [NodeCategory.States]: [],
        [NodeCategory.Texts]: [],
        [NodeCategory.Other]: [],
    };
}