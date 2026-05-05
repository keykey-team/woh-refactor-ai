const SearchModalPopular = ({
  labels,
  items = ["High heels", "Магній"],
  activeQuery,
  onSelect,
}) => {

  return (
    <div className="search-modal__popular">
      <span className="search-modal__popular-label">
        {labels?.popular ?? "Популярне:"}
      </span>

      <div className="search-modal__tags">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={`search-modal__tag ${activeQuery === item ? "search-modal__tag--active" : ""}`}
            onClick={() => onSelect?.(item)}
          >
            <p>{item}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchModalPopular;
