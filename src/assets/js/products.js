import $ from 'jquery'

const d3 = require('d3')
const d3Array = require('d3-array')
const { saveAs } = require('./FileSaver.js')

// const darkGreen = '#4c6b7f'
// const red = '#a20c3e'
const darkRed = '#650827'
const darkGreen = '#4c6b7f'

export default function addSwarm (transfusionData, productType, divId) {
  let binValues = []
  let xText = ''
  if (productType === 'PLATELETS') {
    binValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 1000]
    xText = 'Most recent platelet count'
  }

  if (productType === 'RED CELLS') {
    binValues = [0, 4, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13,
      13.5, 14, 14.5, 15, 20]
    xText = 'Most recent hemoglobin'
  }

  if (productType === 'PLASMA') {
    binValues = [0, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 30, 32,
      34, 36, 40, 44, 60, 80, 100]
    xText = 'Most recent prothrombin time'
  }

  if (productType === 'CRYOPPT') {
    binValues = [0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500]
    xText = 'Most recent fibrinogen'
  }

  var bin = d3Array.bin()
    .value(function (d) { return d.value })
    .thresholds(binValues)
  var bins = bin(transfusionData)

  const newDiv = d3.select('#' + divId)
    .append('div')
    .attr('class', 'new-div')

  const margin = { top: 10, right: 30, bottom: 45, left: 40 }
  const width = 0.9 * $('#' + divId).width()
  const height = 500 - margin.top - margin.bottom

  var x = d3.scaleBand()
    .rangeRound([margin.left + 44.5, width - 80])
    .domain(binValues)

  var xVisual = d3.scaleBand()
    .rangeRound([0, width])
    .domain(binValues)

  var xAxis = d3.axisBottom(xVisual)

  var selectLines = 0
  var selectVals = []

  var svg = newDiv.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .on('click', function (e) {
      console.log('click')
      var tickSpacing = xVisual(bins[1].x1) - xVisual(bins[1].x0)

      if (selectLines < 2) {
        var xCoord = e.offsetX
        console.log(xCoord)

        // Find the closest bin value
        var current = binValues[0]
        var position = 0
        for (var i = 0; i < binValues.length; i++) {
          if (Math.abs(xCoord - xVisual(binValues[i])) < Math.abs(xCoord - xVisual(current))) {
            current = binValues[i]
            position = i
          }
        }

        if (current === binValues[binValues.length - 1] && (xCoord - xVisual(current) > (tickSpacing / 2))) {
          xCoord = xVisual(current) + tickSpacing
          selectVals.push(current)
        } else {
          xCoord = xVisual(current)
          selectVals.push(binValues[position - 1])
        }

        g.append('line')
          .attr('x1', xCoord)
          .attr('x2', xCoord)
          .attr('y1', 0)
          .attr('y2', height)
          .attr('class', 'select_line')
          .attr('stroke-width', 2)
          .attr('stroke', darkGreen)
          .attr('transform', function () {
            return 'translate(-' + tickSpacing / 2 + ',0)'
          })
          .style('stroke-dasharray', [5, 2])
        selectLines++

        if (selectLines === 2) {
          let min, max
          if (selectVals[0] < selectVals[1]) {
            min = selectVals[0]
            max = selectVals[1]
          } else {
            min = selectVals[1]
            max = selectVals[0]
          }
          const selectedUnits = []
          transfusionData.forEach(function (unit) {
            if (unit.value >= min && unit.value <= max) {
              selectedUnits.push(unit)
            }
          })
          statisticsG.append('svg:rect')
            .attr('y', statStart + 65)
            .attr('x', -5)
            .attr('height', 20)
            .attr('width', 250)
            .attr('rx', 4)
            .attr('id', 'saveButton')
            .style('fill', darkGreen)

          statisticsG.append('text')
            .attr('y', statStart + 80)
            .attr('x', 122.5)
            .style('fill', 'white')
            .text('Save')
            .attr('id', 'save_text')
            .attr('font-family', 'sans-serif')
            .style('text-anchor', 'middle')
          console.log(selectedUnits)
          $('#saveButton').on('click', function () { saveSelection(selectVals, selectedUnits) })
          $('#save_text').on('click', function () { saveSelection(selectVals, selectedUnits) })

          statistics('selected', 'Selected Transfusions', selectedUnits, statStart, statisticsG)
        }
      } else if (selectLines >= 2) {
        g.selectAll('line.select_line').remove()
        selectLines = 0
        selectVals = []
        d3.select('#saveButton').remove()
        d3.select('#save_text').remove()
        d3.select('#selected').remove()
      }
    })

  svg.append('rect')
    .attr('x', 0).attr('y', 0)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('fill', 'white')

  svg.append('text')
    .attr('y', height + margin.top + 35)
    .attr('x', (width - margin.left - margin.right) / 2)
    .attr('dominant-baseline', 'baseline')
    .attr('font-family', 'sans-serif')
    .text(xText)

  var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var statisticsG = svg.append('g')
    .attr('transform', 'translate(' + (width - 250) + ',' + (margin.top + 15) + ')')

  statisticsG.append('text')
    .attr('x', 125)
    .attr('text-anchor', 'middle')
    .text('Statistics')
    .attr('font-family', 'sans-serif')
    .style('font-weight', 'bold')

  var statStart = statistics('all', 'All Transfusions', transfusionData, 25, statisticsG)

  var listLength = d3.max(bins, function (d) {
    return d.length
  })

  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  if ((listLength / 5) * 6.5 + 4 > height) {
    drawHistogram(transfusionData, bins, margin, height, width, listLength, binValues, g, x, xVisual)
  } else {
    drawDotChart(bins, margin, height, width, listLength, binValues, g, x, xVisual, divId)
  }
}

function drawDotChart (bins, margin, height, width, listLength, binValues, g, x, xVisual, divId) {
  // The y axis domain must be adjusted because the max number of circles/transfusions
  // in a bin won't necessarily be at max height
  var domainFactor = listLength * (height + margin.top) / (4 + 6.5 * (listLength / 5))

  var y = d3.scaleLinear()
    .range([height + margin.top, margin.top])
    .domain([0, domainFactor])

  // The x1 value of the last bin needs to be set to one of the binValues
  // or it will not scale properly on the x domain
  bins[bins.length - 1].x1 = binValues[binValues.length - 1]
  bins[0].x0 = binValues[0]

  var circleG = g.selectAll('.circle')
    .data(bins)
    .enter()
    .append('g')
    .attr('class', 'circle-g')
    .attr('transform', function (d, i) {
        return 'translate(' + (xVisual(d.x1) - 14.5) + ',' + height + ')'
      },
    )

  var tip = d3.select('#' + divId).append('div')
    .attr('class', 'tooltip')
    .attr('id', divId + '-tool-tip')
    .style('opacity', 0)

  circleG.selectAll('circle')
    .data(d => d.map((p, i) => {
        let specialty = p.specialty_name
        if (!p.specialty_name) { specialty = '' }
        let location = p.location
        if (!p.location) { location = '' }
        return { idx: i, value: p.value, color: p.color, specialty_name: specialty, test: p.test, location: location }
      }),
    )
    .enter()
    .append('circle')
    .attr('cx', function (d) { return 6.5 * (d.idx % 5) })
    .attr('cy', function (d) { return 2 + 6.5 * (-Math.ceil((1 + d.idx) / 5)) })
    .attr('r', 3)
    .attr('class', 'transfusion')
    .attr('data-value', function (d) { return d.value })
    .style('fill', darkRed)
    .on('mouseover', function (event, d) {
      tip.transition()
        .duration(200)
        .style('opacity', 1)
      tip.html(`
        <table>
          <tbody class="tip-table">
            <tr><td class="label"><strong>${d.test}: </strong></td><td class="value">${d.value}</td></tr>
            <tr><td class="label"><strong><strong>Specialty: </strong></td><td class="value">${d.specialty_name}</td></tr>
            <tr><td class="label"><strong><strong>Location: </strong></td><td class="value">${d.location}</td></tr>
          </tbody>
        </table>
      `)
        .style('left', (event.offsetX + 16) + 'px')
        .style('top', (event.offsetY - 16) + 'px')
    })
    .on('mouseout', function (d) {
      tip.transition()
        .duration(500)
        .style('opacity', 0)
    })

  g.append('g')
    .call(d3.axisLeft(y))
    .attr('transform', 'translate(0,-10)')
}

function drawHistogram (data, bins, margin, height, width, listLength, binValues, g, x, xVisual) {
  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(bins, function (d) { return d.length })])

  bins[bins.length - 1].x1 = binValues[binValues.length - 1]
  bins[0].x0 = binValues[0]

  var tickSpacing = xVisual(bins[1].x1) - xVisual(bins[1].x0)

  var bar = g.selectAll('.bar')
    .data(bins)
    .enter().append('g')
    .attr('class', 'bar')
    .attr('transform', function (d, i) { return 'translate(' + xVisual(d.x0) + ',' + y(d.length) + ')' })

  bar.append('rect')
    .attr('x', 1)
    .attr('width', xVisual(bins[1].x1) - xVisual(bins[1].x0) - 10)
    .attr('height', function (d) { return height - y(d.length) })
    .style('fill', darkRed)
    .attr('transform', function (d) {
      return 'translate(' + (5 + tickSpacing / 2) + ',0)'
    })

  g.append('g')
    .call(d3.axisLeft(y))
    .attr('transform', 'translate(0,0)')
}

function statistics (id, label, transfusions, statisticsY, statisticsG) {
  var statisticsContent = statisticsG.append('g')
    .attr('id', id)

  statisticsContent.append('rect')
    .attr('y', statisticsY - 16)
    .attr('x', -5)
    .attr('rx', 4)
    .attr('fill', darkGreen)
    .attr('height', 62)
    .attr('width', 250)

  statisticsContent.append('rect')
    .attr('y', statisticsY + 3).attr('x', -3)
    .attr('height', 2).attr('width', 244)
    .attr('fill', 'white')

  statisticsContent.append('text')
    .attr('font-family', 'sans-serif')
    .attr('fill', 'white')
    .text(label)
    .attr('y', statisticsY)

  // Calculate the min and max
  const min = Math.min.apply(Math, transfusions.map(function (d) {
    return d.value
  }))
  const max = Math.max.apply(Math, transfusions.map(function (transfusion) {
    return transfusion.value
  }))

  // Calculate the median
  var sorted = transfusions.map(function (d) { return parseFloat(d.value) })
  sorted = sorted.sort(sortNumber)
  let med
  if (sorted.length % 2 === 0) {
    med = (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
  } else {
    med = sorted[(sorted.length - 1) / 2]
  }

  statisticsContent.append('text')
    .attr('y', statisticsY + 22)
    .attr('fill', 'white')
    .text(function () {
      return 'Quantity: ' + transfusions.length
    })
    .attr('font-family', 'sans-serif')
  statisticsContent.append('text')
    .attr('y', statisticsY + 37)
    .attr('fill', 'white')
    .text(function () {
      return 'Min,Med,Max: ' + min + ', ' + med + ', ' + max
    })
    .attr('font-family', 'sans-serif')

  return statisticsY + 70
}

function sortNumber (a, b) {
  return a - b
}

function saveSelection (selectVals, data) {
  let min, max
  if (selectVals[0] < selectVals[1]) {
    min = selectVals[0]
    max = selectVals[1]
  } else {
    min = selectVals[1]
    max = selectVals[0]
  }

  let selectedTransfusions = `Units On Day\tUnit Date\tUnit Accession\tDIN\tNumber Of Units\tProduct\tTest Result\tTest Type\t
    Test Accession\tTest Date\tLocation\tProvider\tSpecialty\r\n`
  data.forEach(function (transfusion) {
    if (transfusion.value >= min && transfusion.value <= max) {
      selectedTransfusions += transfusionTextLine(transfusion)
    }
  })

  const blob = new Blob([selectedTransfusions], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'Selected Transfusions.txt', true)
}

function transfusionTextLine (t) {
  const unitDate = new Date(t.time).toISOString().replace(/T/, ' ').replace(/\..+/, '')
  const testDate = new Date(t.test_time).toISOString().replace(/T/, ' ').replace(/\..+/, '')
  const elements = [t.units_on_day, unitDate, t.accession, t.din, t.num_units, t.product, t.test_result, t.test_type,
    t.test_accession, testDate, t.location, t.provider, t.specialty_name]

  return elements.join('\t') + '\r\n'
}
