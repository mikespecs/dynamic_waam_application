function estimateWAAMPropeller({
finishedMassKg,
machiningAllowance = 0.20,

process = "GTAW",

// Effective deposition rate, kg/hour
depositionRateKgPerHour,

// repositioning, acceleration, toolpath motion, etc.
motionOverhead = 0.20,

// Number of deposited layers
layers = 100,

// Average cooling time between layers, minutes
coolingMinutesPerLayer = 1.0,

// Additional layer-change/setup time, minutes/layer
layerChangeMinutes = 0.15,

// Final cooling before machining
finalCoolingHours = 2,

// CNC machining time
machiningHours = 3,

// Material information
material = {
name: "CuAl8Ni6",
densityKgPerM3: 7600,
meltingMinC: 1015,
meltingMaxC: 1045
}
}) {

// --------------------------------------------------
// 1. Calculate required deposited mass
// --------------------------------------------------

const depositedMassKg =
finishedMassKg * (1 + machiningAllowance);


// --------------------------------------------------
// 2. Pure deposition time
//
// mass / deposition rate
// --------------------------------------------------

const depositionHours =
depositedMassKg / depositionRateKgPerHour;


// --------------------------------------------------
// 3. Robot/tool motion overhead
// --------------------------------------------------

const motionHours =
depositionHours * motionOverhead;


// --------------------------------------------------
// 4. Cooling between layers
// --------------------------------------------------

const interlayerCoolingHours =
(layers * coolingMinutesPerLayer) / 60;


// --------------------------------------------------
// 5. Layer changes
// --------------------------------------------------

const layerChangeHours =
(layers * layerChangeMinutes) / 60;


// --------------------------------------------------
// 6. Total WAAM time
// --------------------------------------------------

const waamHours =
depositionHours +
motionHours +
interlayerCoolingHours +
layerChangeHours +
finalCoolingHours;


// --------------------------------------------------
// 7. Total manufacturing time
// --------------------------------------------------

const totalHours =
waamHours +
machiningHours;


// --------------------------------------------------
// 8. Temperature estimate
//
// This is NOT the arc temperature.
// It is an estimated melt-pool operating range.
// --------------------------------------------------

const meltPoolMinC =
material.meltingMinC + 30;

const meltPoolMaxC =
material.meltingMaxC + 150;


// --------------------------------------------------
// 9. Return all useful information
// --------------------------------------------------

return {
process,
material: material.name,

finishedMassKg,
depositedMassKg,

depositionRateKgPerHour,

depositionHours,

motionHours,

interlayerCoolingHours,

layerChangeHours,

finalCoolingHours,

waamHours,

machiningHours,

totalManufacturingHours: totalHours,

temperature: {
meltingRangeC: [
material.meltingMinC,
material.meltingMaxC
],

estimatedMeltPoolRangeC: [
meltPoolMinC,
meltPoolMaxC
]
}
};
}


const copperAlloy = {
name: "CuAl8Ni6",
densityKgPerM3: 7600,
meltingMinC: 1015,
meltingMaxC: 1045
};

const gtaw = estimateWAAMPropeller({
finishedMassKg: 10,
machiningAllowance: 0.20,

process: "GTAW",

depositionRateKgPerHour: 1.5,

motionOverhead: 0.20,

layers: 100,
coolingMinutesPerLayer: 1.0,
layerChangeMinutes: 0.15,

finalCoolingHours: 2,
machiningHours: 3,

material: copperAlloy
});


const ptaw = estimateWAAMPropeller({
finishedMassKg: 10,
machiningAllowance: 0.20,

process: "PTAW",

depositionRateKgPerHour: 3.5,

motionOverhead: 0.15,

layers: 100,
coolingMinutesPerLayer: 0.6,
layerChangeMinutes: 0.10,

finalCoolingHours: 2,
machiningHours: 3,

material: copperAlloy
});


console.log("GTAW:", gtaw);
console.log("PTAW:", ptaw);