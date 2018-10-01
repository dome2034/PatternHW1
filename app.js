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

const separateClass = (dataSource, classLabel) => {
    return dataSource.filter((data) => { return data[4] === classLabel }).map((val) => {
        return val.slice(0, -1);
    })
}

const average = datas => {
    return datas.reduce(([p1, p2, p3, p4], [c1, c2, c3, c4]) => {
        return [parseFloat(p1) + parseFloat(c1), parseFloat(p2) + parseFloat(c2), parseFloat(p3) + parseFloat(c3), parseFloat(p4) + parseFloat(c4)]
    }, [0, 0, 0, 0]).map((sum) => {
        return sum / datas.length
    })
}

const transpose = (array) => {
    return array[0].map((col, i) => array.map(row => row[i]))
}

const multiplyMatrix = (a, b) => {
    let aNumRows = a.length, aNumCols = a[0].length,
        bNumRows = b.length, bNumCols = b[0].length,
        m = new Array(aNumRows)
    for (let r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols)
        for (let c = 0; c < bNumCols; ++c) {
            m[r][c] = 0
            for (let i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c]
            }
        }
    }
    return m
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

const main = async () => {
    let sourceData = await fetchData.then((value) => {
        value.shift()
        return value
    })
    console.log('sourceData length:', sourceData.length)
    const testDatas = setUpTestData(percentValidate, sourceData)
    const trainDatas = setUpTrainData(percentValidate, sourceData)

    const class1 = separateClass(trainDatas[0], '1')
    const class2 = separateClass(trainDatas[0], '2')

    const meanClass1 = average(class1)
    const meanClass2 = average(class2)

    const xMinusMean1 = xMinusMean(class1, meanClass1)
    const xMinusMean2 = xMinusMean(class2, meanClass2)

    const cov1 = multiplyMatrixWithNumber(multiplyMatrix(transpose(xMinusMean1), xMinusMean1), (1 / class1.length))
    const cov2 = multiplyMatrixWithNumber(multiplyMatrix(transpose(xMinusMean2), xMinusMean2), (1 / class2.length))
    
    // console.log(meanClass2)
    //console.log(class1)
}

main()
