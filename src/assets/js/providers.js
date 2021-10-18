import $ from 'jquery'

const d3 = require('d3')
const darkGreen = '#4c6b7f'
// const red = '#a20c3e'
const darkRed = '#650827'
const lightRed = '#C5A2AE'

// var data
// var filters
// var selectedProvider
// var titles = { cryo: 'Cryoprecipitate', plasma: 'Plasma', platelets: 'Platelets', rbcs: 'Red Blood Cells' }

function titleCase (word) {
    return word.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase() })
}

export default async function createProviderGraph (db, rows, productType, anonymous, divId) {
  const providerInfo = await getProviderInfo(db)
  const providerTransfusionData = createProviderDict(rows, providerInfo)
  const transfusionAndStats = await providerStatistics(providerTransfusionData)

  drawGraph(transfusionAndStats, productType, anonymous, '', divId)
}

function createProviderDict (rows, providerData) {
  const data = {}
  rows.forEach(function (row) {
    if (row.test_result !== '-1' && row.product && row.provider) {
      if (data[row.provider] === undefined) {
        data[row.provider] = { units: [], specialty: providerData[row.provider].specialty_name }
      }
      data[row.provider].units.push(row)
    }
  })
  return data
}

function getMedian (arr) {
  const mid = Math.floor(arr.length / 2)
  const nums = [...arr].sort((a, b) => a - b)
  const median = arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
  return median.toFixed(1)
}

function getProviderInfo (db) {
    return new Promise(function (resolve, reject) {
        const sql = 'SELECT * FROM provider'
        const data = {}
        db.all(sql, function (err, rows) {
            if (err) { }
            rows.forEach(function (row) {
                let lastName = ''
                let firstName = ''
                let middleName = ''
                if (row.last_name) { lastName = row.last_name }
                if (row.first_name) { firstName = row.first_name }
                if (row.middle_name) { middleName = row.middle_name }
                let providerName = lastName + ', ' + firstName + ' ' + middleName
                providerName = titleCase(providerName.trim())
                data[providerName] = row
            })
            resolve(data)
        })
    })
}

function providerStatistics (data) {
    return new Promise(function (resolve, reject) {
        const providerStats = { ...data }
        for (var providerName in providerStats) {
            const provider = providerStats[providerName]
            const units = []
            provider.units.forEach(function (unit) {
                if (unit.test_result !== 'none') { units.push(parseFloat(unit.test_result)) }
            })
            provider.testMed = getMedian(units)
            provider.test_min = Math.min(...units)
            provider.test_max = Math.max(...units)
        }
        resolve(providerStats)
    })
}

// var current_svg
function drawGraph (data, productType, anonymous, specialty = '', divId) {
    let providerData = Object.entries(data)
    if (specialty !== '') {
        providerData = providerData.filter(x => x.value.specialty === specialty)
    }

    // const newDiv = d3.select('#' + divId)
    //   .append('div')
    //   .attr('class', 'new-div')
    //   .style('overflow-x', 'auto')

    // Add the svg. If an svg is being redrawn to show a specialty comparsion, insert the svg in the same place
    // var svg = newDiv.append('svg').attr('id', 'providersSvg').attr('class', 'providers-svg')
    var svg = d3.select('#' + divId + ' svg').attr('id', 'providersSvg')

    // Sort the providers by highest median test value
    providerData.sort(function (a, b) { return b[1].testMed - a[1].testMed })

    // Use an anonymous identifier for providers if the checkbox is clicked
    if (anonymous) {
        var i = 1
        providerData.forEach(function (provider) {
            provider[1].anonymous_id = 'Provider ' + i
            provider[1].provider_name = 'Provider ' + i
            provider[1].units.forEach(function (unit) { unit.provider_name = 'Provider ' + i })
            i += 1
        })
    } else {
        providerData.forEach(function (provider) {
            provider[1].provider_name = provider[0]
            provider[1].units.forEach(function (unit) { unit.provider_name = provider[0] })
        })
    }
    // Label the providers on the x-axis either anonymously or with names
    const providerNames = providerData.map(x => x[1].provider_name)

    const divWidth = $('#' + divId).width()
    let width
    if (providerData.length * 30 < divWidth) {
      width = divWidth
    } else {
      width = providerData.length * 30
    }

    svg.attr('width', width)
    svg.attr('height', '550')
    var x = d3.scaleBand()
        .domain(providerNames)
        .range([50, width])

    var xAxis = d3.axisBottom()
        .scale(x)

    const testValues = providerData.map(x => x[1].test_max)
    const max = d3.max(testValues)
    const y = d3.scaleLinear()
        .domain([-2, max])
        .range([410, 40])

    const yAxis = d3.axisLeft()
        .scale(y)
        .tickFormat(function (d) {
            if (d !== -2) { return d } else { return 'None' }
         })

    svg.append('g')
        .attr('transform', 'translate(50, 0)')
        .call(yAxis)

    svg.append('g')
        .attr('transform', 'translate(0, 410)')
        .call(xAxis)
        .selectAll('text')
            .attr('transform', 'rotate(-50)')
            .attr('text-anchor', 'end')

    let tickSpacing
    if (providerNames.length > 1) {
        tickSpacing = x(providerNames[1]) - x(providerNames[0])
    } else {
        tickSpacing = width
    }
    var dataG = svg.append('g')

    var labels = { 'RED CELLS': 'Hemoglobin', PLATELETS: 'Platelet Count', PLASMA: 'Promthrombin Time', CRYOPPT: 'Fibrinogen' }

    // Label for the test
    dataG.append('text')
        .text(labels[productType])
        .attr('x', 0).attr('y', 0)
        .attr('text-anchor', 'middle').attr('alignment-baseline', 'middle')
        .attr('transform', 'translate(12, 200) rotate(-90 0 0)')

    let allUnits = []
    providerData.forEach(function (provider) {
        allUnits.push(provider[1].units)
    })
    allUnits = allUnits.flat()
    const allValues = allUnits.map(x => parseFloat(x.test_result))

    // Line for the overall median
    dataG.append('line')
        .attr('x1', 50).attr('x2', width)
        .attr('y1', y(getMedian(allValues))).attr('y2', y(getMedian(allValues)))
        .attr('stroke', 'rgba(0, 0, 0, 0.2)').attr('stroke-width', 3).attr('stroke-dasharray', '4 4')

    // Vertical grey lines for the providers
    dataG.selectAll('.prov-line')
        .data(providerData)
        .enter()
        .append('line')
            .attr('class', 'prov-line')
            .attr('x1', function (d) { return x(d[1].provider_name) + tickSpacing / 2 })
            .attr('x2', function (d) { return x(d[1].provider_name) + tickSpacing / 2 })
            .attr('y1', 40)
            .attr('y2', 410)
            .attr('stroke', 'rgba(0, 0, 0, .05)')
            .attr('stroke-width', '1')

    dataG.selectAll('.number')
        .data(providerData)
        .enter()
        .append('text')
            .text(function (d) { return d[1].units.length }).attr('text-anchor', 'middle').attr('font-size', '11')
            .attr('class', 'number')
            .attr('x', function (d) { return x(d[1].provider_name) + tickSpacing / 2 })
            .attr('y', function (d) { return y(d[1].test_max) - 4 })

    var tip = d3.select('#' + divId + ' .toolTip')

    dataG.selectAll('.box')
      .data(providerData)
      .enter()
      .append('rect')
        .attr('class', 'box')
        .attr('fill', lightRed)
        .attr('x', function (d) { return x(d[1].provider_name) + tickSpacing / 2 - 5 })
        .attr('y', function (d) { return y(d[1].test_max) })
        .attr('height', function (d) {
            return y(d[1].test_min) - y(d[1].test_max)
        })
        .attr('width', 10)
        .attr('data-specialty', function (d) { return d[1].specialty })
        .attr('data-provider', function (d) { return d[1].provider_name })
        .on('click', function (e, d) {
          $('#' + divId + '.toolTip').data(d)
          tip.select('.stats').html(`
            <table>
              <tbody class="tip-table">
                <tr><td class="label"><strong>Name: </strong></td><td class="value">${d[1].provider_name}</td></tr>
                <tr><td class="label"><strong><strong>Specialty: </strong></td><td class="value">${d[1].specialty}</td></tr>
                <tr><td class="label"><strong><strong>Transfusions: </strong></td><td class="value">${d[1].units.length}</td></tr>
                <tr><td class="label"><strong><strong>Min/Median/Max: </strong></td><td class="value">${d[1].test_min}/${d[1].testMed}/${d[1].test_max}</td></tr>
              </tbody>
            </table>
          `)

          // Place tip towards the right if the right half of the screen is clicked
          const scrolled = $('#' + divId + ' .svg-div').scrollLeft()
          const clickLocation = e.offsetX - scrolled
          const divWidth = $('#' + divId).width()
          let x
          if (clickLocation > divWidth / 2) {
            x = e.offsetX - 21 - scrolled - $('#' + divId + ' .toolTip').width()
          } else {
            x = e.offsetX + 21 - scrolled
          }
          tip.transition()
            .duration(200)
            .style('opacity', 1)
            .style('left', x + 'px')
            .style('top', (e.offsetY - 21) + 'px')
            .style('pointer-events', 'unset')
        })

  dataG.selectAll('.hidden-box')
    .data(providerData)
    .enter()
    .append('rect')
    .attr('class', 'hidden-box')
    .attr('fill', 'transparent')
    .attr('x', function (d) { return x(d[1].provider_name) + tickSpacing / 2 - 5 })
    .attr('y', function (d) { return y(d[1].test_max) - 15 })
    .attr('height', function (d) {
      return y(d[1].test_min) - y(d[1].test_max) + 30
    })
    .attr('width', 10)
    .attr('data-specialty', function (d) { return d[1].specialty })
    .attr('data-provider', function (d) { return d[1].provider_name })
    .on('click', function (e, d) {
      $('#' + divId + '.toolTip').data(d)
      tip.select('.stats').html(`
            <table>
              <tbody class="tip-table">
                <tr><td class="label"><strong>Name: </strong></td><td class="value">${d[1].provider_name}</td></tr>
                <tr><td class="label"><strong><strong>Specialty: </strong></td><td class="value">${d[1].specialty}</td></tr>
                <tr><td class="label"><strong><strong>Transfusions: </strong></td><td class="value">${d[1].units.length}</td></tr>
                <tr><td class="label"><strong><strong>Min/Median/Max: </strong></td><td class="value">${d[1].test_min}/${d[1].testMed}/${d[1].test_max}</td></tr>
              </tbody>
            </table>
          `)
      if (!d[1].specialty) {
        tip.select('.specialty-comparison-button').style('opacity', '0').style('disabled', true).style('cursor', 'default')
      } else {
        tip.select('.specialty-comparison-button').style('opacity', '1').style('disabled', false)
      }

      // Place tip towards the right if the right half of the screen is clicked
      const scrolled = $('#' + divId + ' .svg-div').scrollLeft()
      const clickLocation = e.offsetX - scrolled
      const divWidth = $('#' + divId).width()
      let x
      if (clickLocation > divWidth / 2) {
        x = e.offsetX - 21 - scrolled - $('#' + divId + ' .toolTip').width()
      } else {
        x = e.offsetX + 21 - scrolled
      }
      tip.transition()
        .duration(200)
        .style('opacity', 1)
        .style('left', x + 'px')
        .style('top', (e.offsetY - 21) + 'px')
        .style('pointer-events', 'unset')
    })

    svg.on('click', function (e, d) {
      if (!d3.select(e.target).classed('box') && !d3.select(e.target).classed('hidden-box')) {
        tip.transition()
          .duration(200)
          .style('opacity', 0)
          .style('pointer-events', 'none')
      }
    })
    dataG.selectAll('.median')
        .data(providerData)
        .enter()
        .append('circle')
            .attr('class', 'median')
            .attr('fill', darkGreen)
            .attr('r', '4')
            .attr('cx', function (d) { return x(d[1].provider_name) + tickSpacing / 2 })
            .attr('cy', function (d) { return y(d[1].testMed) })
            .attr('data-specialty', function (d) { return d[1].specialty })
            .style('pointer-events', 'none')

    dataG.selectAll('.transfusion')
        .data(allUnits)
        .enter()
        .append('circle')
            .attr('class', 'transfusion')
            .attr('fill', darkRed)
            .attr('r', '4')
            .attr('cx', function (d) { return x(d.provider_name) + tickSpacing / 2 })
            .attr('cy', function (d) { return y(d.test_result) })
            .attr('opacity', 0)
            .style('pointer-events', 'none')
}

// // Draw a specialty comparison graph when a user selects a provider and clicks the specialty comparison button
// $(document).on('click', '.specialty-comparison-button', function () {
//     $(current_svg).css('display', 'none')
//     var transfusion_data = $(current_svg).data('transfusion_data')
//     var productType = $(current_svg).data('productType')
//     var anonymous = $(current_svg).data('anonymous')
//     var insert_before = $(current_svg).attr('id')
//     drawGraph(transfusion_data, productType, anonymous, $(this).data('specialty'), insert_before)
//     $('.d3-tip').css('opacity', '0').css('pointer-events', 'none')
// })
//
// $(document).on('click', '.providers-svg', function (e) {
//     var current_specialty = $(this).data('specialty')
//     if ($(e.target).hasClass('providers-svg') && current_specialty != '') {
//         var transfusion_data = $(this).data('transfusion_data')
//         var productType = $(this).data('productType')
//         var anonymous = $(this).data('anonymous')
//         var insert_before = $(this).attr('id')
//         $(this).css('display', 'none')
//         drawGraph(transfusion_data, productType, anonymous, '', insert_before)
//     }
// })
//
// $(document).ready(function () {
//     // Remove the tip when scrolling
//     $('#svg-div').on('scroll', function () {
//         $('.d3-tip').css({ opacity: 0, 'pointer-events': 'none' })
//     })
//
//
//     d3.select('#providers-svg').on('click', function () {
//         var target = d3.event.target
//         var target_class = d3.select(target).attr('class') || ''
//         if (target_class.includes('box') || target_class.includes('median')) {
//             var selected_specialty = d3.select(target).attr('data-specialty')
//             selectedProvider = d3.select(target).attr('data-provider')
//             filters.specialty = selected_specialty
//             create_provider_graph(data, filters)
//             $('#title-div').html(titles[filters.product] + ' - ' + selected_specialty)
//         } else {
//             filters = get_filters()
//             selectedProvider = ''
//             create_provider_graph(data, filters)
//         }
//     })
// })
//
