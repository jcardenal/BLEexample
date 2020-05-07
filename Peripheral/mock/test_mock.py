import unittest
from mock import create_mock, Mock


class TestClass():
    def method1(self, param1, param2):
        pass

    def method2(self, arg1, arg2):
        pass


class MockTestCase(unittest.TestCase):
    def test_should_create_mock(self):
        test_mock = create_mock()
        self.assertIsNotNone(test_mock, msg='test mock is None')
        self.assertIsInstance(test_mock, Mock)

    def test_should_create_mock_for_class(self):
        test_mock = create_mock(TestClass)
        self.assertIsNotNone(test_mock)
        self.assertIsInstance(test_mock, Mock)

    def test_should_return_None_by_default(self):
        test_mock = create_mock(TestClass)
        self.assertIsNone(test_mock.method1(1, "hi!"))

    def test_should_return_12(self):
        test_mock = create_mock(TestClass)
        test_mock.when('method1', ('a', 'b'), return_value=12)
        self.assertEqual(test_mock.method1('a', 'b'), 12)
        self.assertIsNone(test_mock.method1(12))

    def test_should_return_hi(self):
        test_mock = create_mock(TestClass)
        test_mock.when('method1', {'param1': 'iweyr', 'param2': 123}, return_value='hi')
        self.assertEqual(test_mock.method1(param1='iweyr', param2=123), 'hi')
        self.assertIsNone(test_mock.method1('ok'))

    def test_should_return_True_always(self):
        test_mock = create_mock(TestClass)
        test_mock.when('method1', return_value=True)
        self.assertEqual(test_mock.method1(param1='iweyr', param2=123), True)
        self.assertEqual(test_mock.method1('ok'), True)
        self.assertEqual(test_mock.method1(), True)
        self.assertIsNone(test_mock.method2())

    def test_should_raise_OSError(self):
        test_mock = create_mock(TestClass)
        test_mock.when('method1', raise_exception=OSError)
        with self.assertRaises(OSError): test_mock.method1('a', 2)

    def test_should_allow_default_ret_value_and_specific_ret_value(self):
        test_mock = create_mock(TestClass)
        test_mock.when('method1', return_value=36)
        test_mock.when('method1', ('a', 7), return_value=11)
        self.assertEqual(test_mock.method1(param1='iweyr', param2=123), 36)
        self.assertEqual(test_mock.method1('ok'), 36)
        self.assertEqual(test_mock.method1('a', 7), 11)
        self.assertEqual(test_mock.method1('a', 9), 36)

    def test_should_raise_OSError_or_not_depending_on_arguments(self):
        test_mock = create_mock(TestClass)
        test_mock.when('method1', ('a', 2), raise_exception=OSError)
        test_mock.when('method1', ('b', 'c'), return_value=12)
        test_mock.when('method1', return_value='hi')
        with self.assertRaises(OSError): test_mock.method1('a', 2)
        self.assertEqual(test_mock.method1('b', 'c'), 12)
        self.assertEqual(test_mock.method1(1,1), 'hi')

    def test_should_have_been_called(self):
        test_mock = create_mock(TestClass)
        self.assertFalse(test_mock.has_been_called())
        test_mock.method1()
        self.assertTrue(test_mock.has_been_called())

    def test_should_reset_mock(self):
        test_mock = create_mock(TestClass)
        test_mock.when('method1', return_value=True)
        self.assertTrue(test_mock.method1())
        self.assertTrue(test_mock.has_been_called())
        test_mock.reset()
        self.assertFalse(test_mock.has_been_called())
        self.assertIsNone(test_mock.method1())

    def test_should_count_times_has_been_called(self):
        test_mock = create_mock(TestClass)
        self.assertFalse(test_mock.has_been_called())
        test_mock.method1()
        self.assertTrue(test_mock.has_been_called())
        test_mock.method2()
        self.assertTrue(test_mock.has_been_called(times=2))
        test_mock.method1('a', 'b')
        self.assertTrue(test_mock.has_been_called(times=3))

    def test_should_count_times_has_been_called_each_method(self):
        test_mock = create_mock(TestClass)
        self.assertFalse(test_mock.has_been_called())
        test_mock.method1()
        self.assertTrue(test_mock.has_been_called(method='method1', times=1))
        test_mock.method2()
        self.assertTrue(test_mock.has_been_called(method='method2', times=1))
        test_mock.method1('a', 'b')
        self.assertTrue(test_mock.has_been_called(method='method1', times=2))

    def test_should_count_times_has_been_called_each_method_with_parameters(self):
        test_mock = create_mock(TestClass)
        self.assertFalse(test_mock.has_been_called())
        test_mock.method1()
        test_mock.method1()
        self.assertTrue(test_mock.has_been_called_with('method1', ()))
        self.assertTrue(test_mock.has_been_called_with('method1', (), times=2))
        self.assertFalse(test_mock.has_been_called_with('method1', (), times=3))
        test_mock.method2('a')
        self.assertTrue(test_mock.has_been_called_with('method2', ('a',)))
        test_mock.method1('a', 'b')
        self.assertTrue(test_mock.has_been_called_with('method1', ('a', 'b'), times=1))
        self.assertFalse(test_mock.has_been_called_with('method1', ('a', 'c'), times=0))
        test_mock.method2(arg2=0, arg1='1')
        self.assertTrue(test_mock.has_been_called_with('method2', {'arg1': '1', 'arg2': 0}))
        self.assertTrue(test_mock.has_been_called_with('method2', {'arg1': '1', 'arg2': 0}, times=1))
        self.assertFalse(test_mock.has_been_called_with('method2', {'arg1': '1', 'arg2': 1}))


if __name__ == '__main__':
    unittest.main()
