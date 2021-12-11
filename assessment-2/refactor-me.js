/**
 * @typedef {object} Item
 * @property {number} id
 * @property {string} name
 * @property {number} unitPrice
 * @property {string} unit
 *
 * Generates sample database
 * @returns {{ items: { [itemId: number]: Item }}}
 */
function buildDatabase() {
  const items = [
    { id: 1, name: "item1", unitPrice: 1.45, unit: "kg" },
    { id: 2, name: "item2", unitPrice: 1.23, unit: "kg" },
    { id: 3, name: "item3", unitPrice: 2.35, unit: "g" },
    { id: 4, name: "item4", unitPrice: 4.56, unit: "kg" },
    { id: 5, name: "item5", unitPrice: 1.34, unit: "kg" },
    { id: 6, name: "item6", unitPrice: 5.67, unit: "kg" },
    { id: 7, name: "item7", unitPrice: 2.34, unit: "g" },
    { id: 8, name: "item8", unitPrice: 3.45, unit: "kg" },
    { id: 9, name: "item9", unitPrice: 9.1, unit: "kg" },
    { id: 10, name: "item10", unitPrice: 1, unit: "g" },
    { id: 11, name: "item11", unitPrice: 2.13, unit: "g" },
    { id: 12, name: "item12", unitPrice: 2.64, unit: "kg" },
    { id: 13, name: "item13", unitPrice: 2.85, unit: "kg" },
    { id: 14, name: "item14", unitPrice: 2.71, unit: "kg" },
    { id: 15, name: "item15", unitPrice: 1.49, unit: "kg" },
    { id: 16, name: "item16", unitPrice: 1.78, unit: "g" },
    { id: 17, name: "item17", unitPrice: 1.59, unit: "kg" },
    { id: 18, name: "item18", unitPrice: 3.55, unit: "g" },
    { id: 19, name: "item19", unitPrice: 4.05, unit: "kg" },
  ];

  const outputDatabase = { items: {} };
  items.forEach((item) => {
    outputDatabase.items[item.id] = item;
  });
  return outputDatabase;
}

const database = buildDatabase();

function summaryApi(largeData) {
  let output = {
    answer: undefined,
    isProcessed: false,
  };

  switch (largeData.action) {
    case "calculate":
      var allDatas = `${largeData.datas}` // Create a copy (May not work if require legacy support).
        .split(";") // Split entries.
        .map(el => el.split(',')); // Split entry parameters.

      // Simplified summation of price. Also fixed conversion errors.
      const calculatePrice = (id, qty, unit) => {
        let price = database.items[id].unitPrice;
        if (database.items[id].unit == 'g') price *= 1000;
        if (unit == 'g') qty /= 1000;
        return price * qty;
      }
      
      /**
       * Use of Array.prototype.reduce() to iterate through the data sum up the price.
       * Destructuring assignment of current element into the element's respective variable.
       */
      let sum = allDatas.reduce((prev, [id, qty, unit]) => prev + calculatePrice(id, qty, unit), 0)

      // Simplified rounding to closest 0.05
      let difference = (sum * 100) % 5
      difference = difference >= 2.5
        ? 5 - difference // Difference to next 5.
        : -difference; // Difference to last 5.
      output.answer = (Math.round(sum * 100) + difference) / 100

      output.isProcessed = true;
      break;

    case "query":
      var allDatas = `${largeData.datas}` // Create copy.
        .split(","); // Split parameters.

      let outputDatas = [...allDatas]
        .map(id => database.items[id]) // Get the item from the db.
        .map(el => {
          let res = {};
          res.itemId = el.id;
          res.kgPrice = el.unitPrice;
          if (el.unit == 'g') res.kgPrice *= 1000;
          return res
        }); // Map the result to have a list of the output objects.

      output.answer = outputDatas || []

      output.isProcessed = true;
      break;

    default:
      output.answer = undefined;
      output.isProcessed = false;
  }

  if (output.isProcessed) {
    return output.answer;
  } else {
    return undefined;
  }
}

const testDatas = [
  {
    testNo: 1,
    input: {
      action: "calculate",
      datas: "1,1,kg;2,2,kg;3,0.15,kg;4,4,kg",
    },
    expectedOutput: 374.65,
  },
  {
    testNo: 2,
    input: {
      action: "calculate",
      datas: "9,10,kg;12,1,kg;16,400,g",
    },
    expectedOutput: 805.65,
  },
  {
    testNo: 3,
    input: {
      action: "query",
      datas: "1",
    },
    expectedOutput: [
      { itemId: 1, kgPrice: 1.45 }
    ],
  },
  {
    testNo: 4,
    input: {
      action: "query",
      datas: "1,2,3,4",
    },
    expectedOutput: [
      { itemId: 1, kgPrice: 1.45 },
      { itemId: 2, kgPrice: 1.23 },
      { itemId: 3, kgPrice: 2350 },
      { itemId: 4, kgPrice: 4.56 },
    ],
  },
];

function testFunction() {
  testDatas.forEach(({ testNo, input, expectedOutput }) => {
    const receivedOutput = summaryApi(input);

    if (typeof receivedOutput === "object") {
      if (JSON.stringify(receivedOutput) !== JSON.stringify(expectedOutput)) {
        console.error(
          `Failed test #${testNo}, Expected: `,
          expectedOutput,
          "Received: ",
          receivedOutput,
        );
      } else {
        console.info(`Passed test #${testNo}`);
      }
    } else {
      if (receivedOutput !== expectedOutput) {
        console.error(
          `Failed test #${testNo}, Expected: `,
          expectedOutput,
          "Received: ",
          receivedOutput,
        );
      } else {
        console.info(`Passed test #${testNo}`);
      }
    }
  });
}

testFunction();
