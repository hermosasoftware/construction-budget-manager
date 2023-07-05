import ReactPaginate from 'react-paginate';
import { CaretLeft, CaretRight } from 'phosphor-react';
import styles from './Pagination.module.css';

interface IPagination {
  totalCount: number;
  itemsPerPage: number;
  handleOnPageChange: (currentPage: number, itemsPerPage: number) => void;
  currentPage: number;
}

const Pagination = (props: IPagination) => {
  const { totalCount, itemsPerPage, handleOnPageChange, currentPage } = props;

  const pageCount = Math.ceil(totalCount / itemsPerPage);

  const firstPage = currentPage === 0;
  const lastPage = currentPage + 1 === pageCount;
  debugger;

  const onPageChange = (obj: { selected: number }) => {
    handleOnPageChange(obj.selected, itemsPerPage);
  };
  console.log('disabled', styles.disabled);
  return (
    <div>
      <ReactPaginate
        containerClassName={styles.pagination_container}
        breakLabel={'...'}
        pageClassName={styles.item_page}
        pageCount={pageCount}
        nextLabel={<CaretRight size={20} />}
        nextClassName={`${styles.page_controller} ${
          lastPage ? styles.disabled : ''
        }`}
        previousLabel={<CaretLeft size={20} />}
        previousClassName={`${styles.page_controller} ${
          firstPage ? styles.disabled : ''
        }`}
        activeClassName={styles.active}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default Pagination;
