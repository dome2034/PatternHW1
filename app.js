let fs = require('fs')
const math = require('mathjs')

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

const separateClass = (dataSource, classLabel) => {
    return dataSource.filter((data) => { return data[4] === classLabel }).map((val) => {
        return val.slice(0, -1)
    })
}

const average = datas => {
    return datas.reduce(([p1, p2, p3, p4], [c1, c2, c3, c4]) => {
        return [parseFloat(p1) + parseFloat(c1), parseFloat(p2) + parseFloat(c2), parseFloat(p3) + parseFloat(c3), parseFloat(p4) + parseFloat(c4)]
    }, [0, 0, 0, 0]).map((sum) => {
        return sum / datas.length
    })
}

const multiplyMatrixWithNumber = (datas, num) => {
    return datas.map((data) => {
        return [parseFloat(data[0]) * num, parseFloat(data[1]) * num, parseFloat(data[2]) * num, parseFloat(data[3]) * num]
    })
}

const xMinusMean = (datas, means) => {
    return datas.map((data) => {
        return [parseFloat(data[0]) - parseFloat(means[0]), parseFloat(data[1]) - parseFloat(means[1]), parseFloat(data[2]) - parseFloat(means[2]), parseFloat(data[3]) - parseFloat(means[3])]
    })
}

const fx = (numClass, cov, xMinusMean) => {
    return (1 / (Math.sqrt(((2 * Math.PI) ^ numClass) * (math.det(cov))))) * math.exp(math.multiply(math.multiply(math.multiply(math.transpose(xMinusMean), -0.5), math.inv(cov)), xMinusMean))
}

const main = async () => {
    let sourceData = await fetchData.then((value) => {
        value.shift()
        return value
    })
    const testDatas = setUpTestData(percentValidate, sourceData)
    const trainDatas = setUpTrainData(percentValidate, sourceData)
    let result = []
    for (i = 0; i <= 9; i++) {
        let testData = testDatas[i].map((val) => {
            return val.slice(0, -1)
        })

        let testClass = testDatas[i].map((val) => {
            return val.slice(4, 5)
        })

        let trainClass1 = separateClass(trainDatas[i], '1')
        let trainClass2 = separateClass(trainDatas[i], '2')

        let meanClass1 = average(trainClass1)
        let meanClass2 = average(trainClass2)

        let trainXMinusMean1 = xMinusMean(trainClass1, meanClass1)
        let trainXMinusMean2 = xMinusMean(trainClass2, meanClass2)

        let cov1 = math.multiply(math.multiply(math.transpose(trainXMinusMean1), trainXMinusMean1), (1 / trainClass1.length))
        let cov2 = math.multiply(math.multiply(math.transpose(trainXMinusMean2), trainXMinusMean2), (1 / trainClass2.length))
        let a = 0, b = 0, c = 0, d = 0
        for (j = 0; j <= 9; j++) {
            let testXMinusMean1 = xMinusMean(testData, meanClass1)
            let testXMinusMean2 = xMinusMean(testData, meanClass2)
            let classChoose
            let fx1 = fx(2, cov1, testXMinusMean1[j])
            let fx2 = fx(2, cov2, testXMinusMean2[j])
            if (fx1 === fx2) { classChoose = Math.floor((Math.random() * 2) + 1) }
            else if (fx1 > fx2) { classChoose = 1 }
            else if (fx1 < fx2) { classChoose = 2 }

            if (parseInt(testClass[j]) === 1 && classChoose === 1) { a = a + 1 }
            else if (parseInt(testClass[j]) === 1 && classChoose === 2) { b = b + 1 }
            else if (parseInt(testClass[j]) === 2 && classChoose === 1) { c = c + 1 }
            else if (parseInt(testClass[j]) === 2 && classChoose === 2) { d = d + 1 }
        }
        console.log(`----------Test ${i+1} --------------`)
        console.log(`|`, a, b, `|`)
        console.log(`|`, c, d, `|`)
        let correct = 100 * (a + d) / (a + b + c + d)
        let error = 100 - correct
        console.log(`correct ${correct} %`)
        console.log(`error ${error} %`)
        console.log(`-------------------------------\n`)
    }

    // console.log(fx(2, cov1, xMinusMean1[0]))
    // console.log(fx(2, cov2, xMinusMean2[0]))
}

main()
