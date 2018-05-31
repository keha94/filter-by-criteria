# Filter By Criteria
> This utility function is used to filter an array of json objects based on a criteria object.
> It was developed to be a generic filter that can be used on data produced from any API.

It requires an Object with criteria, and the Array of data objects.

```js
// Example Criteria object
criteria: {
  name: 'Kevin',
  department: 'Business Systems'
}
// Example Data object
data: [{
  name: 'Bob',
  department: 'Programming'
}, {
  name: 'Kate',
  department: 'Finance'
}, {
  name: 'Kevin',
  department: 'Business Systems'
}]

// Using the filter, an array of just one object with the name of 'Kevin' and department of 'Business Systems' will be returned.
```

**IMPORTANT**  
The keys of every propery within the Criteria, must have a matching key property within the data object. There will be warnings in the console if you do not conform to this.

```js
import filterByCriteria from 'filter-by-criteria'

function filteredData (criteria, dataArray) {
  return filterByCriteria(criteria, dataArray)
}
```

#### Advanced filtering
The default filtering should be sufficient for most cases, however if a certain property requires advanced filtering, there is the option to provide a custom function to the filter for that property key.

**customFilter** must be an Array of Objects with the following properties:
```js
{
  key: String,
  filter: Function (criteria, item)
}
```

Example:
```js
function filteredData (criteria, dataArray) {
  // Array of filter functions - defined with a property key that the filter applies to
  const customFilter = [{
    key: 'department',
    filter: function (criteria, item) {
      // Code your custom filter function here
      // Must return Boolean
      return criteria == item
    }
  }]
  return filterByCriteria(criteria, items, customFilter)
}
```

The above custom filter function will override the default filter function when filtering the 'department' property of all objects within the data array.
