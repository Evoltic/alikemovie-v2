import React from 'react'

export const Markup = (props) => {
  const {
    markupRef,

    openDropdown = (e) => {},
    isDropdownOpen = false,

    handleInputChange = (e) => {},
    inputValue = '',

    isPending = false,
    isNotFound = false,
    isUnknownError = false,
    hint = null,

    items = [],
    currentItemIndex = 0,
    handleItemClick = (e, index) => {},
  } = props

  return (
    <div className="search-bar" ref={markupRef}>
      <input
        className="search-bar__input"
        value={inputValue}
        onClick={openDropdown}
        onChange={handleInputChange}
      />
      <div
        className={
          'search-bar__dropdown ' + isDropdownOpen
            ? 'search-bar__dropdown_open'
            : 'search-bar__dropdown_closed'
        }
      >
        <div className="search-bar__dropdown-box">
          {isPending && (
            <p className="search-bar__loading-hint">Идет поиск...</p>
          )}
          {isNotFound && (
            <p className="search-bar__not-found-hint">Ничего не найдено</p>
          )}
          {isUnknownError && (
            <p className="search-bar__error-hint">
              Упс... Что-то пошло не так, попробуйте изменить запрос
            </p>
          )}
          {hint && (
            <p className="search-bar__improvement-hint">
              <span className="search-bar__hint-label">Подсказка:</span>
              <span className="search-bar__hint-description">{hint}</span>
            </p>
          )}
        </div>
        {items.length > 0 && (
          <div className="search-bar__dropdown-box">
            {items.map((item, i) => (
              <div
                className={
                  'search-bar__item ' +
                  (currentItemIndex === i
                    ? 'search-bar__item_active'
                    : 'search-bar__item_inactive')
                }
                onClick={(e) => handleItemClick(e, i)}
                key={item.id}
              >
                {/*<img*/}
                {/*  className="search-bar__item-image"*/}
                {/*  src={item.thumbnail}*/}
                {/*  alt={item.title}*/}
                {/*/>*/}
                <p className="search-bar__item-text">
                  <span className="search-bar__item-title">{item.title}</span>
                  <span className="search-bar__item-year">
                    {item.startyear}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
