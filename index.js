let chartDataArr = []
let maxPrice
let minPrice
let maxMACD
let minMACD
let minVolumn;
let maxVolumn
const averageP = 20
let nDays = 100;
let leftOffset = 10;
let startIdx,endIdx;
let companyName = "MSFT"
const url = `./${companyName}.csv`
let xIndexes = [];
let xPositions =  [];
let valueGap
let dateGap
const mediaQuery=1200
let marginW = window.innerWidth > mediaQuery ? 80 : 60
let marginH = 60
const horizontalP = 6
let chartWidth = window.innerWidth - 2 * marginW
let chartHeight = window.innerHeight - 2 * marginH
let priceHeight
let verticalP = window.innerWidth > mediaQuery ? 11 : 5
const color1 = "white"
const color2 = "red"
const color3 = "#696969"
let chartTop
let chartBottom
let priceBottom
let macdHeight = 200;
let chartLeft
let chartRight
let avg = [5,10,30]
let avgColor=['red','yellow','cyan']
let titleRect;
let stockList = []
let isWorking = false;

const selStock = document.getElementById('selStock')

const getStockList = async ()=>{
    let respond = await fetch(`/stocklist`)
    if (respond.ok){
        let jres = await respond.json();
        if (jres.result){
            stockList = []
            jres.result.forEach(x=>stockList.push(x.name.toUpperCase()))
        }
    }
    return stockList
}

// read raw data and process, draw
const getData = async () =>{
    isWorking = true;
    try {
        //const response = await fetch(url)
        //const data = await response.text()
        //getChartDataFromCSV(data)
        await getDataFromServer(companyName);
        isWorking = false;
        draw()
    }
    catch (err) {
        console.log(err)
    }
    isWorking = false;
}

// process data
const getDataFromServer = async(name)=> {
    let respond = await fetch(`/stock/${name}`)
    if (respond.ok){
        let jres = await respond.json();
        if (jres.result){
            // Oldest first
            chartDataArr = jres.result.reverse();
            // Format date from time to date
            if (chartDataArr){
                for (let i=0;i<chartDataArr.length;i++){
                    chartDataArr[i].d = new Date(chartDataArr[i].d).toLocaleDateString();
                }
                getAvg();
                calculateMACD();
            }
        }
        else{
            alert(`Failed to get data of ${name}`)
        }
    }
    else{
        alert(`Failed to get data of ${name}`)
    }
    
}

// process data
const getChartDataFromCSV = (txt)=> {

    txt = txt.replaceAll('$','')
    let intialArr = txt.split("\n").slice(1)
    let len = intialArr.length-1

    // get date and close value
    for (let i = 0; i < len; i++) {
        const subArr = intialArr[i].split(",")
        let h = parseFloat(subArr[4]);
        let l = parseFloat(subArr[5]);
        chartDataArr.unshift({d:subArr[0], o:parseFloat(subArr[3]),h,l,c:parseFloat(subArr[1]),v:parseInt(subArr[2])})
    }
    getAvg();
}

const getAvg=()=>{
    avg.forEach(a=>{
        // Get first a average values
        let v = chartDataArr[0].c;
        for (let i=1;i<a;i++){
            v += chartDataArr[i].c
        }
        
        chartDataArr[a-1][`a${a}`] = v/a;
        for (let i=a;i<chartDataArr.length;i++){
            v -= chartDataArr[i-a].c
            v += chartDataArr[i].c
            chartDataArr[i][`a${a}`] = v/a;
        }
    })
}

const getIndexes = ()=>{
    endIdx = chartDataArr.length-1;
    startIdx = endIdx-nDays+1;
    minPrice = chartDataArr[startIdx].l;
    maxPrice = chartDataArr[startIdx].h;
    minVolumn = chartDataArr[startIdx].v;
    maxVolumn = minVolumn;
    maxMACD = chartDataArr[startIdx].ma>chartDataArr[startIdx].si?chartDataArr[startIdx].ma:chartDataArr[startIdx].si
    maxMACD = chartDataArr[startIdx].hi>maxMACD?chartDataArr[startIdx].hi:maxMACD
    minMACD = chartDataArr[startIdx].ma<chartDataArr[startIdx].si?chartDataArr[startIdx].ma:chartDataArr[startIdx].si
    minMACD = minMACD>chartDataArr[startIdx].hi?chartDataArr[startIdx].hi:minMACD
    for (let i=startIdx+1;i<endIdx+1;i++){
        if (minPrice>chartDataArr[i].l){
            minPrice = chartDataArr[i].l;
        }
        if (maxPrice<chartDataArr[i].h){
            maxPrice = chartDataArr[i].h;
        }
        if (minVolumn>chartDataArr[i].v){
            minVolumn=chartDataArr[i].v
        }
        if (maxVolumn<chartDataArr[i].v){
            maxVolumn=chartDataArr[i].v
        }
        if (minMACD>chartDataArr[i].ma){
            minMACD = chartDataArr[i].ma
        }
        if (minMACD>chartDataArr[i].si){
            minMACD = chartDataArr[i].si
        }
        if (maxMACD<chartDataArr[i].ma){
            maxMACD = chartDataArr[i].ma
        }
        if (maxMACD<chartDataArr[i].si){
            maxMACD = chartDataArr[i].si
        }
    }
    let d = maxPrice-minPrice;
    maxPrice+= d/20;
    minPrice-=d/20;
    d = (maxMACD-minMACD)/10.0;
    minMACD -= d;
    maxMACD += d;

}


const findClosestIndex = (target)=> {
  return xPositions.reduce((closestIndex, currentValue, currentIndex) => {
    return Math.abs(currentValue - target) < Math.abs(xPositions[closestIndex] - target)
      ? currentIndex
      : closestIndex;
  }, 0);
}

const canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d",{ willReadFrequently: true })


canvas.onclick = (event)=>{
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Click on title, select different stock
    if (x>titleRect.l && x<(titleRect.l+titleRect.w) && y>titleRect.t && y<(titleRect.t+titleRect.h)){
        selStock.style.left = `${chartLeft}px`;
        selStock.style.top = `${chartTop-5}px`;
        selStock.style.display = "block"
    }
    else{
        selStock.style.display = "none"
    }
}
// draw in canvas
function draw() {

    if (chartDataArr.length === 0||isWorking)
        return

    isWorking = true;
    verticalP = window.innerWidth > mediaQuery ? 11 : 5
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    

    marginW = window.innerWidth > mediaQuery ? 100 : 80

    // declare chart start and end positions
    chartTop = marginH
    chartBottom = window.innerHeight - marginH
    priceBottom = chartBottom - macdHeight;
    chartLeft = marginW
    chartRight = window.innerWidth - marginW

    getIndexes();


    chartWidth = chartRight-chartLeft
    chartHeight = chartBottom-chartTop
    priceHeight = chartHeight-macdHeight;
    priceBottom = chartBottom - macdHeight;
    valueGap = priceHeight / (maxPrice - minPrice)
    dateGap = chartWidth / nDays


    ctx.fillStyle = color1
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    // draw x and y axis
    ctx.font = "1rem Arial"
    ctx.beginPath()
    ctx.strokeStyle = color1
    ctx.moveTo(chartLeft, chartBottom)
    ctx.lineTo(chartRight, chartBottom)
    ctx.lineTo(chartRight, chartTop)
    ctx.moveTo(chartLeft, priceBottom)
    ctx.lineTo(chartRight, priceBottom)
    ctx.stroke()
    ctx.fillText(minPrice.toFixed(2), chartRight + 15, priceBottom);

    // draw reference horizontal lines + mark values   
    let horizontalRatio = priceHeight / horizontalP
    for (let i = 1; i <= horizontalP; i++) {
        ctx.beginPath()
        ctx.strokeStyle = color3
        ctx.moveTo(chartLeft, priceBottom - horizontalRatio * i)
        ctx.lineTo(chartRight, priceBottom - horizontalRatio * i)
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.fillText((minPrice + (maxPrice - minPrice) * i / horizontalP).toFixed(2), chartRight + 15, priceBottom - horizontalRatio * i)
    }

    // draw reference vertical lines + mark dates   
    let verticalRatio = chartWidth / verticalP
    for (let j = 0; j < verticalP; j++) {
        ctx.beginPath()
        ctx.strokeStyle = color3
        ctx.moveTo(chartLeft + verticalRatio * j, chartTop)
        ctx.lineTo(chartLeft + verticalRatio * j, chartBottom)
        ctx.stroke()
        let date = chartDataArr[startIdx+Math.floor(nDays * j / verticalP)].d
        ctx.fillText(date, chartLeft + verticalRatio * j - 45, chartBottom + 20)
    }



    // draw close Vale 
    if (dateGap>10){
        drawCandle(ctx)
    }
    else if (dateGap>7)
    {
        drawOHLC(ctx)
    }
    else
    {
        drawLineChart(ctx,color1)
    }
    drawAvgLines(ctx)
    drawMACD(ctx)
    drawVolumn(ctx)
    // clear top
    ctx.fillStyle = color1
    ctx.clearRect(0, 0, window.innerWidth, marginH)

    // draw company name
    ctx.font = "1.8rem Arial"
    ctx.fillText(`${companyName}`, chartLeft, chartTop - 20);
    let rc = ctx.measureText(`${companyName}`);
    titleRect = {l:chartLeft,t:chartTop - 20 -rc.fontBoundingBoxAscent,w:rc.width,h:rc.fontBoundingBoxAscent}



    isWorking = false;
}


// save partial canvas imgdata,later put back to canvas
let imgData
// previous mounse X position
let prevMouseX
// handle mouse move
canvas.onmousemove = (e) => {
    // Prevent drawing while loading
    if (isWorking){
        return;
    }
    let range = canvas.getBoundingClientRect();
    let xValue = e.clientX - range.left
    let yValue = e.clientY - range.top
    // restore canvas without indicator lines
    if (imgData) {
        ctx.putImageData(imgData, chartLeft, chartTop)
    }
    // if mouse is in chart
    if (xIndexes && xValue > chartLeft && xValue < chartRight && yValue > chartTop && yValue < chartBottom) {
        // find current chart array index by mouse position
        //let index = Math.round((xValue - left) * nDays / chartWidth)+startIdx
        let index = findClosestIndex(xValue)+startIdx
        // get exact x position of the day
        xValue = xPositions[index-startIdx];

        if (index <= endIdx) 
        {
            // save previous x
            prevMouseX = xValue - 1
            // Save canvas without indicator lines
            if (!imgData)
                imgData = ctx.getImageData(chartLeft, chartTop, chartWidth, chartHeight)
            // draw indicator
            ctx.beginPath()
            ctx.font = "1rem Arial"
            ctx.strokeStyle = 'white'
            // draw vertical line
            ctx.moveTo(xValue, chartTop)
            ctx.lineTo(xValue, chartBottom)
            // draw horizental line
            ctx.moveTo(chartLeft, yValue)
            ctx.lineTo(chartRight, yValue)

            // clean label field
            ctx.fillStyle = 'black'
            ctx.fillRect(chartLeft+130, chartTop - 40,680,30);
            ctx.stroke()
            // draw and show label
            ctx.font = "1rem Arial"

            ctx.fillStyle = "white"
            let x = chartLeft+130;
            let y = chartTop - 25;
            let content = `${chartDataArr[index].d} `;
            ctx.fillText(content, x, y);
            x += ctx.measureText(content).width

            ctx.fillStyle = chartDataArr[index].o>chartDataArr[index].c?'red':'lightgreen'
            content = `O ${chartDataArr[index].o} H ${chartDataArr[index].h} L ${chartDataArr[index].l} C ${chartDataArr[index].c}`
            ctx.fillText(content, x, y);
            x += ctx.measureText(content).width

            content = "";
            avg.forEach(v=>{
                if (chartDataArr[index][`a${v}`]){
                    content += ` A${v}:${chartDataArr[index][`a${v}`].toFixed(0)}`
                }
            })
            ctx.fillStyle = 'orange'
            ctx.fillText(content, x, y);

        }
    }
}
canvas.onwheel = (event) => {
    event.preventDefault();
    let d = event.deltaY>0?20:-20;
    nDays += d;
    nDays = nDays<20?20:nDays;
    nDays = nDays>chartDataArr.length?chartDataArr.length-10:nDays;
    imgData = null;
    draw();
};


const drawVolumn = (ctx)=> {
    ctx.save();
    ctx.rect(chartLeft, chartTop, chartWidth, priceHeight); // x, y, width, height
    ctx.clip();        
    
    ctx.lineJoin = "round"
    let nStart = chartDataArr.length-nDays;
    let value = chartDataArr[nStart];
    let cl = chartLeft + leftOffset;
    let gap = 100/(maxVolumn-minVolumn);
    for (var k = 0; k < nDays; k++) {
        ctx.beginPath();
        ctx.setLineDash([])
        value = chartDataArr[nStart+k];
        ctx.strokeStyle = 'grey'
        let l = dateGap * k + cl;
        ctx.moveTo(l, (priceBottom))
        ctx.lineTo(l, (priceBottom - (value.v - minVolumn) * gap))
        ctx.stroke()
    }
    ctx.restore();
}



const getCandleColor = (value)=>{
    if (value.c>value.o){
        return 'MediumSeaGreen'
    }
    else if (value.c<value.o){
        return 'Crimson'
    }
    return 'white'
}


// draw line chart function
const drawLineChart = (ctx,color)=> {
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.lineJoin = "round"
    ctx.strokeStyle = color
    let nStart = chartDataArr.length-nDays;
    ctx.moveTo(chartLeft, (priceBottom - (chartDataArr[nStart].c - minPrice) * valueGap))
    xIndexes = []
    xPositions = [];
    xIndexes.push(nStart);
    xPositions.push(chartLeft)
    for (var k = 1; k < nDays; k++) {
        ctx.lineTo(dateGap * k + chartLeft, (priceBottom - (chartDataArr[nStart+k].c - minPrice) * valueGap))
        xIndexes.push(nStart+k)
        xPositions.push(dateGap * k + chartLeft)
    }
    ctx.stroke()
}


const drawCandle = (ctx)=> {
    
    ctx.lineJoin = "round"
    let nStart = chartDataArr.length-nDays;
    let value = chartDataArr[nStart];
    xIndexes = []
    xPositions = [];

    let gap = Math.floor(dateGap/4)
    let cl = chartLeft + leftOffset;
    for (var k = 0; k < nDays; k++) {
        ctx.beginPath();
        ctx.setLineDash([])
        value = chartDataArr[nStart+k];
        ctx.strokeStyle = getCandleColor(value)
        ctx.moveTo(dateGap * k + cl, (priceBottom - (value.h - minPrice) * valueGap))
        ctx.lineTo(dateGap * k + cl, (priceBottom - (value.l - minPrice) * valueGap))
        ctx.fillStyle = ctx.strokeStyle
        let min = value.c>value.o?value.o:value.c
        let max = value.c<value.o?value.o:value.c
        ctx.fillRect(dateGap * k + cl-gap,(priceBottom - (max - minPrice) * valueGap),2*gap,(max-min) * valueGap)
        ctx.stroke()
        xIndexes.push(nStart+k)
        xPositions.push(dateGap * k + cl)
    }
}

const drawOHLC = (ctx)=> {
    
    ctx.lineJoin = "round"
    let nStart = chartDataArr.length-nDays;
    let value = chartDataArr[nStart];
    xIndexes = []
    xPositions = [];
    let cl = chartLeft + leftOffset;
    ctx.save();
    // set clip area to prevent overflow
    ctx.rect(chartLeft, chartTop, chartWidth, priceHeight); // x, y, width, height
    ctx.clip();        
    for (var k = 0; k < nDays; k++) {
        ctx.beginPath();
        ctx.setLineDash([])
        value = chartDataArr[nStart+k];
        ctx.strokeStyle = getCandleColor(value)
        let l = dateGap * k + cl;
        ctx.moveTo(l, (priceBottom - (value.h - minPrice) * valueGap))
        ctx.lineTo(l, (priceBottom - (value.l - minPrice) * valueGap))
        ctx.moveTo(l, (priceBottom - (value.o - minPrice) * valueGap))
        ctx.lineTo(l-2, (priceBottom - (value.o - minPrice) * valueGap))
        ctx.moveTo(l, (priceBottom - (value.c - minPrice) * valueGap))
        ctx.lineTo(l+2, (priceBottom - (value.c - minPrice) * valueGap))
        ctx.stroke()
        xIndexes.push(nStart+k)
        xPositions.push(dateGap * k + cl)
    }
    ctx.restore();

}

const drawAvgLines =  (ctx) =>{
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.lineJoin = "round"
    ctx.save();
    ctx.rect(chartLeft, chartTop, chartWidth, priceHeight); // x, y, width, height
    ctx.clip();        

    avg.forEach((v,idx)=>{
        ctx.strokeStyle = avgColor[idx]
        let nStart = chartDataArr.length-nDays;
        let d = 0;
        if (nStart<v){
            d = v-nStart;
        }
        ctx.beginPath()
        ctx.moveTo(chartLeft+d*dateGap, (priceBottom - (chartDataArr[nStart+d][`a${v}`] - minPrice) * valueGap))
        for (var k = d+1; k < nDays; k++) {
            
            try{
                ctx.lineTo(dateGap * k + chartLeft, (priceBottom - (chartDataArr[nStart+k][`a${v}`] - minPrice) * valueGap))
            }
            catch(error){
                console.log(v,nStart+k)
            }
            
        }
        ctx.stroke()
    })
    ctx.restore();
}

const drawMACD = (ctx)=>{
    ctx.setLineDash([])
    ctx.lineJoin = "round"
    ctx.save();
    ctx.rect(chartLeft, priceBottom, chartWidth, macdHeight); // x, y, width, height
    ctx.clip();        


    let nStart = chartDataArr.length-nDays;
    let dMACD = (macdHeight)/(maxMACD-minMACD);
    // draw macd line (short term)
    ctx.strokeStyle = "orange"
    let cl = chartLeft + leftOffset;
    ctx.beginPath();
    ctx.moveTo(cl, (chartBottom - (chartDataArr[nStart].ma - minMACD) * dMACD))
    for (var k = 1; k < nDays; k++) {
        ctx.lineTo(dateGap * k + cl, (chartBottom - (chartDataArr[nStart+k].ma - minMACD) * dMACD))
    }

    ctx.stroke()
    // draw signature line 
    ctx.beginPath();
    ctx.strokeStyle = "lightblue"
    ctx.moveTo(cl, (chartBottom - (chartDataArr[nStart].si - minMACD) * dMACD))
    for (var k = 1; k < nDays; k++) {
        ctx.lineTo(dateGap * k + cl, (chartBottom - (chartDataArr[nStart+k].si - minMACD) * dMACD))
    }
    ctx.stroke()
    // draw zero axis
    ctx.strokeStyle = "grey"
    ctx.beginPath();
    let y0 = (chartBottom + (minMACD) * dMACD);
    ctx.moveTo(cl, y0)
    ctx.lineTo(chartRight, y0)
    ctx.stroke()
    // Draw histogram

    if (dateGap>10){
        let gap = Math.floor(dateGap/4)
        for (var k = 0; k < nDays; k++) {
            ctx.beginPath();
            ctx.setLineDash([])
            let value = chartDataArr[nStart+k].hi;
            ctx.fillStyle = value>0?'lightgreen':'red'
            let x = dateGap * k + cl -gap
            let h = value * dMACD;
            if (value>0){
                ctx.fillRect(x,y0-h,2*gap,h)
            }
            else{
                ctx.fillRect(x,y0,2*gap,-h)
            }
            
            ctx.stroke()
        }
    }
    else{
        for (var k = 0; k < nDays; k++) {
            ctx.beginPath();
            ctx.setLineDash([])
            let value = chartDataArr[nStart+k].hi;
            ctx.strokeStyle = value>0?'lightgreen':'red'
            let x = dateGap * k + cl
            ctx.moveTo(x, y0)
            if (value>0){
                ctx.lineTo(x, (y0 - value * dMACD))
            }
            else{
                ctx.lineTo(x, (y0 + value * dMACD))
            }
            
            ctx.stroke()
        }
    }
    ctx.restore();
}

// load
document.body.onload = async() => {
    let list = await getStockList();
    companyName = list[0]
    list.forEach(x=>{
        const option = document.createElement('option');
        option.value = x
        option.textContent = x
        selStock.appendChild(option); // Append to the <select>    })
    })
    await getData()
}
// resize
window.onresize = () => {imgData=null;draw()}

selStock.onchange = async(event)=>{
    event.preventDefault();
    let v = selStock.value;
    companyName = v;
    imgData = null;
    await getData()
    selStock.style.display = 'none'
}

// Helper function to calculate EMA
const calculateEMA = (data,period) => {
  const k = 2 / (period + 1); // Smoothing factor
  let ema = [];
  let previousEMA = data[0]; // Start with the first data point

  ema.push(previousEMA); // Add the first EMA value

  for (let i = 1; i < data.length; i++) {
    const currentEMA = (data[i] - previousEMA) * k + previousEMA;
    ema.push(currentEMA);
    previousEMA = currentEMA;
  }

  return ema;
}

// Function to calculate MACD
const calculateMACD = (shortPeriod = 12, longPeriod = 26, signalPeriod = 9)=> {
    let data =[];
    chartDataArr.forEach(v=>{
        data.push(v.c)
    })
    const shortEMA = calculateEMA(data,shortPeriod);
    const longEMA = calculateEMA(data,longPeriod);
    // Calculate MACD line
    const macdLine = shortEMA.map((value, index) => value - longEMA[index]);

    // Calculate Signal line (EMA of MACD line)
    const signalLine = calculateEMA(macdLine, signalPeriod);

    // Calculate Histogram (MACD - Signal)
    const histogram = macdLine.map((value, index) => value - signalLine[index]);
    chartDataArr.forEach((v,i)=>{
        v["ma"]=macdLine[i]
        v["si"]=signalLine[i]
        v["hi"]=histogram[i]
    })
}

