
const EventSchema = `
  # Event
  #
  type Event {
    name: String!
    # duration in minutes of the recurrance... if an interval of time
    # is required some types of events don't require this
    duration: Int
    recurrences: [ Recurrence! ]!
  }
  # Recurrence
  type Recurrence {
    # For each schedule type below the specific type (eg. s) may
    # only have nothing as a suffix, '_a', or '_b' but it can
    # only be one of those.
    # SECOND schedule types
    s: Int
    s_a: Int
    s_b: Int
    # MINUTE schedule types
    m: Int
    m_a: Int
    m_b: Int
    # DAY schedule types
    # int representation of day of the week 1-7 
    d: Int
    d_a: Int
    d_b: Int
    # int representation of day of the month 0-31 ( 0 for last )
    D: Int    
    D_a: Int
    D_b: Int
    # int representation of the number of types a 
    # day has ocurred within a week 0-5 ( 0 for last )
    dc: Int
    dc_a: Int
    dc_b: Int
    # int representation of day of the year 0-366 ( 0 for last )
    dw: Int
    dw_a: Int
    dw_b: Int
    # MONTH schedule types
    M: Int
    M_a: Int
    M_b: Int
    # MONTH schedule types
    Y: Int
    Y_a: Int
    Y_b: Int
  }
  # input recurrance for an event
  input EventI {
    # duration in minutes of the recurrance... if an interval of time
    # is required some types of events don't require this
    duration: Int
    recurrences: [ RecurrenceI! ]!
  }
  input RecurrenceI {
    # For each recurrence type below the specific type (eg. s) may
    # only have nothing as a suffix, '_a', or '_b' but it can
    # only be one of those.
    # SECOND recurrence types
    s: Int
    s_a: Int
    s_b: Int
    # MINUTE recurrence types
    m: Int
    m_a: Int
    m_b: Int
    # DAY recurrence types
    # int representation of day of the week 1-7 
    d: Int
    d_a: Int
    d_b: Int
    # int representation of day of the month 0-31 ( 0 for last )
    D: Int    
    D_a: Int
    D_b: Int
    # int representation of the number of types a 
    # day has ocurred within a week 0-5 ( 0 for last )
    dc: Int
    dc_a: Int
    dc_b: Int
    # int representation of day of the year 0-366 ( 0 for last )
    dw: Int
    dw_a: Int
    dw_b: Int
    # MONTH recurrence types
    M: Int
    M_a: Int
    M_b: Int
    # MONTH recurrence types
    Y: Int
    Y_a: Int
    Y_b: Int
  }
`

export default [ EventSchema ];
