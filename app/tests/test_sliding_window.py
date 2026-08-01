########### EXTERNAL IMPORTS ############

import pytest

#########################################

############# LOCAL IMPORTS #############

from model.struct.sliding_window import SlidingWindow

#########################################


def test_add_and_peek_most_recent():
    window = SlidingWindow[int](max_size=3)
    window.add(1)
    window.add(2)
    assert window.peek() == 2
    assert window.peek(1) == 1


def test_discards_oldest_when_full():
    window = SlidingWindow[int](max_size=2)
    window.add(1)
    window.add(2)
    window.add(3)
    assert window.get_list() == [3, 2]


def test_get_list_orders_most_recent_first():
    window = SlidingWindow[int](max_size=5)
    for i in range(3):
        window.add(i)
    assert window.get_list() == [2, 1, 0]


def test_pop_left_removes_most_recent():
    window = SlidingWindow[int](max_size=5)
    window.add(1)
    window.add(2)
    assert window.pop_left() == 2
    assert window.get_list() == [1]


def test_pop_right_removes_oldest():
    window = SlidingWindow[int](max_size=5)
    window.add(1)
    window.add(2)
    assert window.pop_right() == 1
    assert window.get_list() == [2]


def test_peek_out_of_range_raises_index_error():
    window = SlidingWindow[int](max_size=2)
    window.add(1)
    with pytest.raises(IndexError):
        window.peek(5)


def test_pop_from_empty_window_raises_index_error():
    window = SlidingWindow[int](max_size=2)
    with pytest.raises(IndexError):
        window.pop_left()
