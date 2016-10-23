import React from 'react'
import styles from './SearchBar.scss'

class SearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      query: this.props.currentFilter.filter || '',
      sumBy: this.props.currentFilter.sum_by || '',
      sumByVisible: false,
    }
    this.state.showClear = this.state.query != '' || this.state.sumBy != ''
    this.state.sumByVisible = this.state.sumBy != ''

    this.filterKeydown = this.filterKeydown.bind(this)
    this.filterOnChange = this.filterOnChange.bind(this)
    this.sumByOnChange = this.sumByOnChange.bind(this)
    this.showSumBy = this.showSumBy.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.clearQuery = this.clearQuery.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    // Override text field with default query when provided
    if (nextProps.currentFilter.filter != this.props.currentFilter.filter) {
      this.setState({query: nextProps.currentFilter.filter})
    }
  }

  filterKeydown(event) {
    this.setState({lastKeypress: event.key})
  }

  filterOnChange(event) {
    const input = event.target
    const key = this.state.lastKeypress
    let value = event.target.value
    let cursorPosition = input.selectionStart

    switch (key) {
      case '"':
        value = value.substr(0, value.length - 1) + "'"
        break
      case "'":
        if (value[cursorPosition] == "'" &&
            value[cursorPosition - 1] == "'") {
          value = value.substr(0, cursorPosition-1)
            + value.substr(cursorPosition)
        }
        break
      case '(':
        value = value.substr(0, cursorPosition)
          + ')'
          + value.substr(cursorPosition)

        break
      case ')':
        if (value[cursorPosition] == ')' &&
            value[cursorPosition - 1] == ')') {
          value = value.substr(0, cursorPosition-1)
            + value.substr(cursorPosition)
        }
        break
    }

    this.setState({query: value})

    // Setting selection range only works after the onChange
    // handler has completed
    setTimeout(() => {
      input.setSelectionRange(cursorPosition, cursorPosition)
    }, 0)
  }

  showSumBy() {
    this.setState({sumByVisible: true})
  }

  sumByOnChange(event) {
    this.setState({sumBy: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault()

    if (this.state.query == '' && this.state.sumBy == '') {
      if (this.props.currentFilter.filter || this.props.currentFilter.sum_by) {
        this.clearQuery()
      }
      return
    }

    this.setState({ showClear: true })

    const query = {}
    if (this.state.query) query.filter = this.state.query
    if (this.state.sumBy) query.sum_by = this.state.sumBy

    this.props.pushList(query)
  }

  clearQuery() {
    this.setState({ query: '', sumBy: '', showClear: false })
    this.props.pushList()
  }

  render() {
    let usesSumBy = false
    let searchFieldClass = styles.search_field_full

    if (this.props.sumBy !== undefined) usesSumBy = true
    if (this.state.sumByVisible) searchFieldClass = styles.search_field_half

    return (
      <div className={styles.main}>
        <form onSubmit={this.handleSubmit}>
          <span className={`${styles.searchField} ${searchFieldClass}`}>
            <input
              value={this.state.query || ''}
              onKeyDown={this.filterKeydown}
              onChange={this.filterOnChange}
              className={`form-control ${styles.search_input}`}
              type='search'
              autoFocus='autofocus'
              placeholder='Enter filter...' />

            {usesSumBy && !this.state.sumByVisible &&
              <span onClick={this.showSumBy} className={styles.showSumBy}>set sum_by</span>}
          </span>

          {usesSumBy && this.state.sumByVisible &&
            <span className={styles.sum_by_field}>
              <input
                value={this.state.sumBy}
                onChange={this.sumByOnChange}
                className={`form-control ${styles.search_input} ${styles.sum_by_input}`}
                type='search'
                autoFocus='autofocus'
                placeholder='Enter sum_by...' />
            </span>}

            {/* This is required for form submission */}
            <input type='submit' className={styles.submit} />
        </form>

        {this.state.showClear && <span className={styles.queryTime}>
          Queried at {this.props.queryTime} –&nbsp;
          <span type='button'
            className={styles.clearSearch}
            onClick={this.clearQuery}>
              Clear Filter
          </span>
        </span>}

      </div>
    )
  }
}

export default SearchBar
