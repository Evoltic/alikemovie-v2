import React from 'react'
import './index.scss'
import SearchIcon from '/assets/icons/search.svg'
import { LoadingLine } from '/components/loadingLine'
import { SmartImage } from '/components/smartImage'

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
    <div
      className={`search-box ${
        isDropdownOpen
          ? 'search-box_dropdown-open'
          : 'search-box_dropdown-closed'
      }`}
      ref={markupRef}
    >
      <div className="search-box__input-container">
        <input
          className="search-box__input"
          placeholder="Search your favorite movie"
          value={inputValue}
          onClick={openDropdown}
          onChange={handleInputChange}
        />
        <SearchIcon className="search-box__search-icon" />
      </div>
      <LoadingLine className="search-box__loading-line" isLoading={isPending} />
      <div className="search-box__dropdown">
        <div className="search-box__dropdown-box">
          {isPending && (
            <p className="search-box__loading-hint">Searching...</p>
          )}
          {isNotFound && !isPending && (
            <p className="search-box__not-found-hint">Nothing found</p>
          )}
          {isUnknownError && !isPending && (
            <p className="search-box__error-hint">
              Ops... Something went wrong, try changing the query
            </p>
          )}
          {hint && !isPending && (
            <p className="search-box__improvement-hint">
              <span className="search-box__hint-label">Hint:</span>
              <span className="search-box__hint-description">{hint}</span>
            </p>
          )}
        </div>
        {items.length > 0 && !isPending && (
          <div className="search-box__dropdown-box">
            {items.map((item, i) => (
              <div
                className={
                  'search-box__item ' +
                  (currentItemIndex === i
                    ? 'search-box__item_active'
                    : 'search-box__item_inactive')
                }
                onClick={(e) => handleItemClick(e, i)}
                key={item.id}
              >
                {item.type === 'tvSeries' && (
                  <p className="search-box__tv-label" title="TV series">
                    tv
                  </p>
                )}
                <SmartImage
                  className="search-box__item-image"
                  src={
                    process.env.CONTENT_API_URL + `/movies/${item.id}/poster`
                  }
                  alt={item.title}
                />
                <div className="search-box__item-text">
                  <p className="search-box__item-title">
                    {item.title} {item.type === 'tvSeries' && '(TV Series)'}
                  </p>
                  <p className="search-box__item-year">{item.startyear}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
