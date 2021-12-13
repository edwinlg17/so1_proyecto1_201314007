#include <linux/module.h>	/* Nesesario para todos los modulos */
#include <linux/kernel.h>	/* Nesesario para informacion del kernel */

#include <linux/init.h>		/* Nesesario para macros */
#include <linux/proc_fs.h>
#include <asm/uaccess.h>
#include <linux/seq_file.h>
#include <linux/hugetlb.h>

#include <linux/sched.h>
#include <linux/mm.h>
#include <linux/cred.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Edwin Alfredo Lopez Gomez");	
MODULE_DESCRIPTION("Modulo de Ram");	
MODULE_SUPPORTED_DEVICE("testdevice");

struct task_struct *proceso, *hijo;
struct list_head *hijos;

static int _escribir(struct seq_file *archivo, void *v){
	unsigned long rss;

	seq_printf(archivo, "[ { \"Nombre\": \"\", \"PID\": -1, \"Estado\": -1, \"RAM\": -1, \"UID\": -1, \"Usuario\": \"\", \"SubProcesos\": [] }");

	for_each_process(proceso){
		if (proceso->mm) {
			rss = get_mm_rss(proceso->mm) << PAGE_SHIFT;
			seq_printf(archivo, ", { \"Nombre\": \"%s\", \"PID\": %d, \"Estado\": %ld, \"RAM\": %lu, \"UID\": %d, \"Usuario\": \"\", \"SubProcesos\": ", proceso->comm, proceso->pid, proceso->state, rss/1024, __kuid_val(proceso->cred->uid));
		} else {
			seq_printf(archivo, ", { \"Nombre\": \"%s\", \"PID\": %d, \"Estado\": %ld, \"RAM\": 0, \"UID\": %d, \"Usuario\": \"\", \"SubProcesos\": ", proceso->comm, proceso->pid, proceso->state, __kuid_val(proceso->cred->uid));
		}

		seq_printf(archivo, "[ { \"Nombre\": \"\", \"PID\": -1, \"Estado\": -1, \"RAM\": -1, \"UID\": -1, \"Usuario\": \"\", \"SubProcesos\": [] }");

		list_for_each(hijos, &(proceso->children)){
			hijo = list_entry(hijos, struct task_struct, sibling);

			if (hijo->mm) {
				rss = get_mm_rss(hijo->mm) << PAGE_SHIFT;
				seq_printf(archivo, ", { \"Nombre\": \"%s\", \"PID\": %d, \"Estado\": %ld, \"RAM\": %lu, \"UID\": %d, \"Usuario\": \"\", \"SubProcesos\": [] }", hijo->comm, hijo->pid, hijo->state, rss/1024, __kuid_val(hijo->cred->uid));
			} else {
				seq_printf(archivo, ", { \"Nombre\": \"%s\", \"PID\": %d, \"Estado\": %ld, \"RAM\": 0, \"UID\": %d, \"Usuario\": \"\", \"SubProcesos\": [] }", hijo->comm, hijo->pid, hijo->state, __kuid_val(hijo->cred->uid));
			}
		}

		seq_printf(archivo, "]}");
	}
	seq_printf(archivo, "]");
	return 0;
}

static int al_abrir(struct inode *inode, struct file *file){
	return single_open(file, _escribir, NULL);
}

static struct proc_ops operaciones = {
	.proc_open = al_abrir,
	.proc_read = seq_read
};

static int init_201314007(void){
	printk(KERN_INFO "201314007 \n");
	proc_create("cpu_201314007", 0, NULL, &operaciones);
	return 0;
}

static void exit_201314007(void){
    remove_proc_entry("cpu_201314007", NULL);
    printk(KERN_INFO "Sistemas Operativos 1 \n");
}

module_init(init_201314007);
module_exit(exit_201314007);
