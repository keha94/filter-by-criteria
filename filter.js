const Moment = require('moment')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)

const dateRegex = /(\d{2})\-(\w{3})\-(\d{2})/g
const startRegex = /(start|from)/gi
const endRegex = /(end|to)/gi

const isValidDate = function (date) {
  // Checks if valid moment - using moment functions
  if (typeof date.isValid === 'function') {
    if (!date.isValid()) {
      console.warn('Invalid Item Date:', item)
      return false
    }
  } else if (!moment.isRange(date)) {
    console.warn('Invalid Item Date:', item)
    return false
  }
  return true
}

const convertToMoment = function (date) {
  // Returns either a date range object - consisting of a start/end moment
  // Or a single moment object
  if (dateRegex.test(date)) {
    // Given date is a string
    return moment(date, 'DD-MMM-YY')
  } else if (isDateRange(date)) {
    if (typeof date.start === 'string' || typeof date.end === 'string') {
      // Given dates are strings
      return moment.range(moment(date.start, 'DD-MMM-YY'), moment(date.end, 'DD-MMM-YY'))
    } else {
      return moment.range(moment(date.start), moment(date.end))
    }
  } else {
    return moment(date)
  }
}

const compareDates = function (item, criteria) {

  const itemDate = convertToMoment(item)
  const criteriaDate = convertToMoment(criteria)

  // If either date is invalid, will output warning and return false
  if (!isValidDate(itemDate)) return false
  if (!isValidDate(criteriaDate)) return false
  
  // Conditional comparisons
  if (moment.isRange(criteriaDate)) {
    if (moment.isRange(itemDate)) {
      // If both item/criteria are date ranges
      return itemDate.overlaps(criteriaDate)
    } else {
      // If criteria is a date range and item is a single date
      return itemDate.within(criteriaDate)
    }
  } else {
    if (moment.isRange(itemDate)) {
      // If criteria is a single date and item is a date range
      return criteriaDate.within(itemDate)
    } else {
      // If both item/criteria are single dates
      return criteriaDate.isSame(itemDate)
    }
  }

  console.warn('compareDates did not work for:', itemDate)
  return false
}

const isDateRange = function (elem) {
  // Checks if given element is a valid Date Range object.
  // Valid Format ---> { start: startDate, end: endDate }
  if (typeof elem !== 'object') return false
  let keys = Object.keys(elem)
  if (keys.length === 2) {
    return keys.every(key => {
      return (key === 'start' || key === 'end')
    })
  }
  return false
}

const isDateObject = function (elem) {
  if (typeof elem !== 'object') return false

  // Check if single javascript date object
  if (typeof elem.getMonth === 'function') return true

  // Check if v-calendar date range object
  return isDateRange(elem)
}

const filterByCriteria = function (criteria, items, customFilters) {
  // Matches each criteria key with an identical item key.
  // Performs a comparison based on the TYPE of the item/criteria.

  // OPTIONAL:
  // customFilters is an array of objects with a key and function.
  // It can be used to define custom filter function for a certain key
  /* EXAMPLE:
  [{ 
    key: 'example', 
    filter: function (criteria, item) { 
      return item === true 
    }
  }]
  */

  const criteriaKeys = Object.keys(criteria)
  return items.filter(item => {
    return criteriaKeys.every(key => {
      // If item has criteria
      if (item[key] !== undefined && criteria[key] !== undefined && criteria[key] !== null) {

        // Skip criteria if an empty array or value
        if (criteria[key].length === 0) return true

        // If criteria is provided, value in item must exist
        if (item[key] == null || item[key].length === 0) return false

        // Check if a custom filter function was provided
        if (customFilters !== undefined) {
          const custom = customFilters.find(elem => {
            return elem.key == key
          })
          if (custom !== undefined) {
            // Perform comparision using custom filter function
            try {
              return custom.filter(criteria[key], item[key])
            } catch (err) {
              console.warn('Error when using custom filter KEY:', key, 'ERROR:', err)
              return false
            }
          }
        }

        let criteriaType = typeof criteria[key]
        let itemType = typeof item[key]
        // Determines method of comparison based on type of item and criteria
        try {

          if (itemType === 'object' && Array.isArray(item[key])) {
            // Item is an Array
            return item[key].some(elem => {
              if (criteriaType === 'object' && Array.isArray(criteria[key])) {
                // If both are arrays
                return criteria[key].some(c => { return c === elem })
              } else {
                return (elem === criteria[key])
              }
            })
          } else {

            if (criteriaType === 'string') {
              if (dateRegex.test(criteriaType[key])) {
                // If Date String
                return compareDates(item[key], criteria[key])
              } else {
                // Normal case insensitive regex search
                let regex = new RegExp(criteria[key], 'i')
                return regex.test(item[key])
              }
            } else if (criteriaType === 'number' || criteriaType === 'boolean') {
              return (item[key] === criteria[key])
            } else if (criteriaType === 'object' && Array.isArray(criteria[key])) {
              return (criteria[key].includes(item[key]))
            } else if (isDateObject(criteria[key])) {
              // Criteria is a Date object
              return compareDates(item[key], criteria[key])
            } else {
              return false
            }

          }
        } catch (err) {
          console.warn('Error when comparing items in KEY:', key, 'ERROR:', err)
          return false
        }
      } else if (item[key] === undefined) {
        console.warn('Item does not have a matching criteria KEY:', key)
        return true
      } else {
        return true
      }
    })
  })
}

module.exports = filterByCriteria