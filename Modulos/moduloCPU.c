#include <linux/module.h>	/* Nesesario para todos los modulos */
#include <linux/kernel.h>	/* Nesesario para informacion del kernel */

#include <linux/init.h>		/* Nesesario para macros */
#include <linux/proc_fs.h>
#include <asm/uaccess.h>
#include <linux/seq_file.h>
#include <linux/hugetlb.h>

#include <linux/sched.h>
#include <linux/mm.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Edwin Alfredo Lopez Gomez");	
MODULE_DESCRIPTION("Modulo de Ram");	
MODULE_SUPPORTED_DEVICE("testdevice");

struct task_struct *proceso, *hijo;
struct list_head *hijos;

static int _escribir(struct seq_file *archivo, void *v){
	unsigned long rss;

	for_each_process(proceso){
		seq_printf(archivo, "nombre: %s, PID: %d, estado:%li \n", proceso->comm, proceso->pid, proceso->state);

		list_for_each(hijos, &(proceso->children)){
			hijo = list_entry(hijos, struct task_struct, sibling);

			if (hijo->mm) {
				rss = get_mm_rss(hijo->mm) << PAGE_SHIFT;
				seq_printf(archivo, "\tnombre: %s, PID: %d, estado: %ld, ram: %lu \n", hijo->comm, hijo->pid, hijo->state, rss);
			} else {
				seq_printf(archivo, "\tnombre: %s, PID: %d, estado:%ld \n", hijo->comm, hijo->pid, hijo->state);
			}
		}
	}
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
	proc_create("moduloCPU", 0, NULL, &operaciones);
	return 0;
}

static void exit_201314007(void){
    remove_proc_entry("moduloCPU", NULL);
    printk(KERN_INFO "Sistemas Operativos 1 \n");
}

module_init(init_201314007);
module_exit(exit_201314007);
