let fs = require('fs')

let input = fs.readFileSync('TWOCLASS.dat', 'utf8')
const percentValidate = 10

const fetchData = Promise.resolve(
    input.trim().split('\r\n').map(x => x.split('\t'))
)

const setUpTestData = (percentValidate, data) => {
    const testDataNum = data.length / percentValidate
    const round = data.length / testDataNum
    let testDatas = []
    for (i = 0; i < round; i++) {
        testDatas.push(data.slice((i * testDataNum), (i * testDataNum + testDataNum)))
    }
    return testDatas
}

const setUpTrainData = (percentValidate, data) => {
    const testDataNum = data.length / percentValidate
    const round = data.length / testDataNum
    let trainDatas = []
    for (i = 0; i < round; i++) {
        let trainData = []
        for (j = 0; j < data.length; j++) {
            if (j < (i * testDataNum) || j >= (i * testDataNum + testDataNum)) {
                trainData.push(data[j])
            }
        }
        trainDatas.push(trainData)
    }
    return trainDatas
}

const main = async () => {
    let sourceData = await fetchData.then((value) => {
        value.shift()
        return value
    })
    console.log('sourceData length:', sourceData.length)
    const testDatas = setUpTestData(percentValidate, sourceData)
    const trainDatas = setUpTrainData(percentValidate, sourceData)

    console.log(testDatas[0])
    console.log(trainDatas[0])

}

main()
