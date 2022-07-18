#!/usr/bin/env node

const { createObjectCsvWriter } = require('csv-writer')
const DateFns = require('date-fns')
const { promises: fs } = require('fs')
const path = require('path')
const shasum = require('shasum')
const yargs = require('yargs')

const createReport = require('./create-report')
const { createLogger } = require('../../util/logger')

const logger = createLogger({ service: 'create-report' })

yargs // eslint-disable-line
  .command('run [start, end]', 'run reporting', (yargs) => {
    yargs
      .positional('start', {
        alias: 'from',
        type: 'string',
        default: DateFns.format(DateFns.startOfMonth(new Date()), 'yyyy-MM-dd'),
        describe: 'report start date'
      })
      .positional('end', {
        alias: 'to',
        type: 'string',
        default: DateFns.format(
          DateFns.addMonths(DateFns.startOfMonth(new Date()), 1),
          'yyyy-MM-dd'
        ),
        describe: 'report end date'
      })
  }, (argv) => {
    createCsvReport(argv.start, argv.end)
  })
  .help()
  .argv

const BASE_DATA_DIR = process.env.BASE_DATA_DIR || '/'

async function createCsvReport (start, end, options = {}) {
  const { filename = `report-${start}-${end}.csv`, sort: sortKey = 'artist_total_eur' } = options

  try {
    const report = await createReport(start, end, options)

    const result = report.data
      .sort((a, b) => b[sortKey] - a[sortKey]) // sort by plays descending

    const outputPath = path.join(BASE_DATA_DIR, '/data/reports/', filename)

    await createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: 'artist_id', title: 'artist id' },
        { id: 'label', title: 'label' },
        { id: 'artist', title: 'artist' },
        { id: 'track_album', title: 'album' },
        { id: 'track_id', title: 'track id' },
        { id: 'track_title', title: 'track title' },
        { id: 'plays', title: 'play count' },
        { id: 'avg', title: 'avg earned per play' },
        { id: 'resonate_total', title: 'resonate share' },
        { id: 'resonate_total_eur', title: 'resonate share in euros' },
        { id: 'artist_total', title: 'artist share' },
        { id: 'artist_total_eur', title: 'artist share in euros' },
        { id: 'earned', title: 'total earned' }
      ]
    }).writeRecords(result)

    const stats = await fs.stat(outputPath)
    const file = await fs.readFile(outputPath)

    const sha1sum = shasum(file)

    return {
      outputPath,
      filename,
      stats,
      sha1sum
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

module.exports = createCsvReport
